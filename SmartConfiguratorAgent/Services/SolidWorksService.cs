using System;
using System.IO;
using System.Threading;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;
using SmartConfigurator.Agent.Models;
using SmartConfigurator.Agent.Utils;

namespace SmartConfigurator.Agent.Services
{
    public class SolidWorksService
    {
        private readonly SldWorks swApp;
        private ModelDoc2? swModel;

        public SolidWorksService()
        {
            // Visible = true para ver SolidWorks durante las pruebas
            swApp = new SldWorks { Visible = true };
        }

        // =========================
        // 1) PIEZA: abrir, modificar cotas y guardar SLDPRT
        // =========================
        public void OpenPart(TaskModel task)
        {
            string partPath = Config.BaseModelPath;
            LoggerService.Log($"Abriendo modelo base: {partPath}");

            int errors = 0, warnings = 0;
            swModel = (ModelDoc2)swApp.OpenDoc6(
                partPath,
                (int)swDocumentTypes_e.swDocPART,
                (int)swOpenDocOptions_e.swOpenDocOptions_Silent,
                "", ref errors, ref warnings
            );
            LoggerService.Log($"OpenDoc6 -> errors={errors}, warnings={warnings}");
            if (swModel == null) throw new Exception("No se pudo abrir el modelo base (.SLDPRT).");

            SetDimension("D1@Croquis1", task.Length);
            SetDimension("D2@Croquis1", task.Height);
            SetDimension("D1@Saliente-Extruir1", task.Depth);

            swModel.ForceRebuild3(false);

            string saveName = $"cube_{task.Length}x{task.Height}x{task.Depth}.SLDPRT";
            string outputPath = Path.Combine(Config.OutputPath, saveName);

            int actErr = 0;
            swApp.ActivateDoc2(swModel.GetTitle(), false, ref actErr);

            if (File.Exists(outputPath)) File.Delete(outputPath);
            LoggerService.Log($"Intentando guardar: {outputPath}");

            int saveErr = 0, saveWarn = 0;
            bool ok = swModel.Extension.SaveAs(
                outputPath,
                (int)swSaveAsVersion_e.swSaveAsCurrentVersion,
                (int)swSaveAsOptions_e.swSaveAsOptions_Silent,
                null, ref saveErr, ref saveWarn
            );
            LoggerService.Log($"SaveAs -> ok={ok}, errors={saveErr}, warnings={saveWarn}");
            if (!ok) throw new Exception("Fallo al guardar la pieza (.SLDPRT).");

            LoggerService.Log($"Model saved: {outputPath}");
        }

        private void SetDimension(string name, double valueMm)
        {
            if (swModel == null) throw new Exception("swModel es null; documento no abierto.");
            var dim = (Dimension)swModel.Parameter(name);
            if (dim == null) throw new Exception($"No se encontró la cota: {name}");
            dim.SystemValue = valueMm / 1000.0; // mm → m
        }

        // =========================
        // 2) DIBUJO: crear SLDDRW + acotar vista frontal + exportar PDF
        // =========================
        public void GenerateDrawing(TaskModel task)
        {
            string drwTemplate = Config.DrawingTemplatePath;
            string modelFile = Path.Combine(Config.OutputPath, $"cube_{task.Length}x{task.Height}x{task.Depth}.SLDPRT");

            string drawingName = $"cube_{task.Length}x{task.Height}x{task.Depth}.SLDDRW";
            string drawingPath = Path.Combine(Config.OutputPath, drawingName);
            string pdfPath = Path.Combine(Config.OutputPath, $"cube_{task.Length}x{task.Height}x{task.Depth}.pdf");

            LoggerService.Log($"Creando dibujo desde plantilla: {drwTemplate}");
            LoggerService.Log($"Usando modelo: {modelFile}");
            LoggerService.Log($"Guardando en: {drawingPath}");

            if (!File.Exists(modelFile))
                throw new Exception($"No existe el modelo generado: {modelFile}");
            if (!File.Exists(drwTemplate))
                throw new Exception($"Plantilla no encontrada: {drwTemplate}");

            // Cerrar documentos previos para evitar interferencias
            swApp.CloseAllDocuments(true);

            // Reabrir el modelo generado
            int errors = 0, warnings = 0;
            ModelDoc2 modelDoc = (ModelDoc2)swApp.OpenDoc6(
                modelFile,
                (int)swDocumentTypes_e.swDocPART,
                (int)swOpenDocOptions_e.swOpenDocOptions_Silent,
                "", ref errors, ref warnings
            );
            LoggerService.Log($"Reabriendo modelo modificado -> errors={errors}, warnings={warnings}");

            // Crear nuevo dibujo desde plantilla
            ModelDoc2? drw = (ModelDoc2?)swApp.NewDocument(
                drwTemplate,
                (int)swDwgPaperSizes_e.swDwgPaperA4size, 0, 0);
            if (drw == null)
                throw new Exception("No se pudo crear el documento de dibujo (.SLDDRW).");

            int actErr = 0;
            swApp.ActivateDoc2(drw.GetTitle(), false, ref actErr);
            var swDraw = (DrawingDoc)drw;

            // === INSERTAR VISTAS ===
            swApp.ActivateDoc(drw.GetTitle());
            LoggerService.Log("Documento de dibujo activado correctamente.");

            View? frontView = swDraw.CreateDrawViewFromModelView3(
                modelFile, "*Front", 0.105, 0.225, 0);
            if (frontView == null)
                throw new Exception("No se pudo insertar la vista frontal del modelo.");
            LoggerService.Log("Vista frontal insertada en (0.105, 0.225).");

            View? isoView = swDraw.CreateDrawViewFromModelView3(
                modelFile, "*Isometric", 0.105, 0.125, 0);
            if (isoView == null)
                LoggerService.Log("Advertencia: no se pudo insertar la vista isométrica.");
            else
                LoggerService.Log("Vista isométrica insertada en (0.105, 0.125).");

            drw.ForceRebuild3(true);
            LoggerService.Log("Vistas creadas y dibujo reconstruido correctamente.");

            // === ACOTACIÓN AUTOMÁTICA ===
            swDraw.ActivateView(frontView.GetName2());
            Thread.Sleep(300);
            drw.ForceRebuild3(true);

            ModelDoc2 activeDoc = (ModelDoc2)swApp.ActiveDoc;
            if (activeDoc == null)
                throw new Exception("No se pudo obtener el documento activo para insertar cotas.");

            bool selected = activeDoc.Extension.SelectByRay(
                0.105, 0.225, -0.0005,
                0, 0, -1,
                0.001,
                2,
                false, 0, 0
            );
            LoggerService.Log($"SelectByRay -> {selected}");

            // === Invocar InsertModelAnnotations3 por COM late-binding ===
            object comObj = activeDoc;
            Type comType = comObj.GetType();
            object[] args = new object[] { 0, 557064, true, true, false, true };

            object vAnnotations = comType.InvokeMember(
                "InsertModelAnnotations3",
                System.Reflection.BindingFlags.InvokeMethod,
                null,
                comObj,
                args
            );

            if (vAnnotations != null)
                LoggerService.Log("Cotas insertadas correctamente en la vista frontal (vía COM late-binding).");
            else
                LoggerService.Log("No se insertaron cotas (vAnnotations = null).");

            drw.ForceRebuild3(true);
            LoggerService.Log("Dibujo reconstruido tras inserción de cotas.");

            // === GUARDAR Y EXPORTAR PDF ===
            if (File.Exists(drawingPath)) File.Delete(drawingPath);

            int saveErr = 0, saveWarn = 0;
            bool okDrw = drw.Extension.SaveAs(
                drawingPath,
                (int)swSaveAsVersion_e.swSaveAsCurrentVersion,
                (int)swSaveAsOptions_e.swSaveAsOptions_Silent,
                null, ref saveErr, ref saveWarn
            );
            LoggerService.Log($"SaveAs drawing -> ok={okDrw}, errors={saveErr}, warnings={saveWarn}");
            if (!okDrw)
                throw new Exception("Fallo al guardar el dibujo (.SLDDRW).");

            int pdfErr = 0;
            swApp.ActivateDoc2(drw.GetTitle(), false, ref pdfErr);
            int pdfSaveErr = 0, pdfSaveWarn = 0;
            bool pdfOk = drw.Extension.SaveAs(
                pdfPath,
                (int)swSaveAsVersion_e.swSaveAsCurrentVersion,
                (int)swSaveAsOptions_e.swSaveAsOptions_Silent,
                null, ref pdfSaveErr, ref pdfSaveWarn
            );

            if (pdfOk && File.Exists(pdfPath))
                LoggerService.Log($"PDF saved: {pdfPath}");
            else
                LoggerService.Log($"Fallo al exportar el PDF. ok={pdfOk}, errors={pdfSaveErr}, warnings={pdfSaveWarn}");

            // === CERRAR DOCUMENTOS Y LIBERAR MEMORIA ===
            LoggerService.Log("Cerrando documentos para liberar recursos...");
            try
            {
                swApp.CloseDoc(modelDoc.GetTitle());
                swApp.CloseDoc(drw.GetTitle());
                LoggerService.Log("Modelo y dibujo cerrados correctamente.");
            }
            catch (Exception ex)
            {
                LoggerService.Log($"Error al cerrar documentos: {ex.Message}");
            }
        }
    }
}

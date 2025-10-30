# SolidWorks Model and Drawing Automation

This project automates the generation of SolidWorks models and drawings.  
With only a frontend interface, it is possible to modify the CAD model and automatically obtain:
- A new 3D model  
- A new technical drawing with dimensions  
- A PDF file of the updated drawing  

---

## 🧩 Requirements
- **SolidWorks**
- **Visual Studio**

---

## ⚙️ Project Flow

1. A request is made from the **frontend** to the **backend** endpoints.  
2. Locally, a **C# agent** runs every **10 seconds**, checking the `/task` endpoint to see if a new request exists.  
3. If a new task is found, the agent immediately executes the required changes in SolidWorks and generates the new files.

---

## 🚀 How to Make It Work

### Frontend
- Install all dependencies.  
- Deploy the application.  
- Update the `API_URL` in the configuration file.

### Backend
- Install dependencies.  
- Deploy the backend service.  
- Update the `DATABASE_URL`.  
- Adjust the **CORS** configuration to include the correct IPs for the frontend.

### Local Agent (C#)
In the configuration file located inside the **"SolidWorks"** folder, update the following paths:
- `API_URL`
- `BaseModelPath`
- `DrawingTemplatePath`
- `OutputPath`

Don’t forget to import the **SolidWorks dependencies** into your project.  
Using **Visual Studio** is recommended, as it simplifies the import process for these references.

---

## 🧠 Final Notes
Before running the full workflow:
- Test all backend endpoints using **Postman**.
- Ensure that the connection with the **PostgreSQL** database is working correctly.

Once verified, you’re ready to use the system to automatically generate and export new SolidWorks models and drawings.


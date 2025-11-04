import { useContext } from "react";
import { ToastContext } from "../contexts/ToastContext";
import Toast from "./Toast";
import "./Toast.css";

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

export default ToastContainer;

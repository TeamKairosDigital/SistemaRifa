import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBb9UPKIqoTTB68H2J-JXozbWzu1kUOlS8",
    authDomain: "rifa-con-causa-tayson.firebaseapp.com",
    projectId: "rifa-con-causa-tayson",
    storageBucket: "rifa-con-causa-tayson.firebasestorage.app",
    messagingSenderId: "331195222003",
    appId: "1:331195222003:web:29849ab31d10a8b089b486",
    measurementId: "G-12KRHS7D3M"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Función de login
window.login = async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "admin.html";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "Correo o contraseña incorrectos.",
        confirmButtonColor: '#3085d6'
      });
    }
  };

// Exporta para que pueda usarse desde HTML (si es necesario)
window.login = login;


function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
  
    const isHidden = passwordField.type === 'password';
    passwordField.type = isHidden ? 'text' : 'password';
    toggleIcon.classList.toggle('fa-eye', !isHidden);
    toggleIcon.classList.toggle('fa-eye-slash', isHidden);
  }
  

  window.togglePassword = togglePassword;

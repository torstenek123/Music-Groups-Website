'use strict';  

function fnValidate(e) {
    //const form = document.querySelector('.needs-validation')
    const form = document.querySelector('#formValidate')
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add('was-validated')
    }
    else{
      
      //What you have to do on success
      
    }
  }  

  let velem = document.querySelector('#btnValidate');
  velem.addEventListener('click', fnValidate);
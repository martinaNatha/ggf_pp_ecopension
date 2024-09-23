document.getElementById('fileInput1').addEventListener('change', handleFileSelect);
document.getElementById('fileInput2').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const button = fileInput.parentElement;
    const fileIcon = button.querySelector('.file-icon');
    const fileNameSpan = button.querySelector('.file-name');

    if (file && file.type === 'text/csv') {
        fileIcon.classList.add('uploaded');
        fileNameSpan.textContent = file.name;
        button.classList.add('uploaded');
    } else {
        Swal.fire({
            title: 'Warning',
            text: "Please upload a CSV file.",
            icon: 'warning'
        })
        fileInput.value = ''; // Clear the input
        fileNameSpan.textContent = 'No file selected';
        button.classList.remove('uploaded');
    }
}

function uploadFiles() {
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);

    formData.append('username', user_name);
    formData.append('email', email);

    fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(data => {
            if (data.status == "202") {
                Swal.fire({
                    title: 'Success',
                    text: data.msg,
                    icon: 'success'
                })
            } else {

                Swal.fire({
                    title: 'Error',
                    text: data.msg,
                    icon: 'error'
                })
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Error',
                text: data.msg,
                icon: 'error'
            })
        });
}

// file1.originalname
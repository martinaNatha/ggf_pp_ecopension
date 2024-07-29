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
    const fileInput1 = document.getElementById('fileInput1').files[0];
    const fileInput2 = document.getElementById('fileInput2').files[0];

    if (!fileInput1 || !fileInput2) {
        Swal.fire({
            title: 'Warning',
            text: "Please upload both files.",
            icon: 'warning'
        })
        return;
    }

    const formData = new FormData();
    formData.append('file1', fileInput1);
    formData.append('file2', fileInput2);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.status == "202"){
            Swal.fire({
                title: 'Success',
                text: data.message,
                icon: 'success'
            })
        }else{
            Swal.fire({
                title: 'Error',
                text: data.message,
                icon: 'error'
            })
        }
        return
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
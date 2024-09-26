fetch('https://ipapi.co/json/')
.then(response => response.json())
.then(data => {
    const country = data.country_name; // Get the country name from the response
    document.getElementById('country').innerText = `Your country: ${country}`;
})
.catch(error => console.error('Error fetching the country:', error));
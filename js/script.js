
function showPage(pageId) {
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('preferences-page').classList.add('hidden');
    
    document.getElementById(pageId).classList.remove('hidden');
}


document.querySelectorAll('.range-slider').forEach(slider => {
    slider.addEventListener('input', function() {
        const display = this.parentElement.querySelector('.percentage');
        display.innerText = this.value + '%';
    });
});
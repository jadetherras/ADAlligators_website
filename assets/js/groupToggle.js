document.querySelectorAll('.graph-toggle').forEach(toggle => {
    toggle.addEventListener('change', function () {
      const targetGroup = document.getElementById(this.dataset.target);
      const violentGraph = targetGroup.querySelector('.violent');
      const peacefulGraph = targetGroup.querySelector('.peaceful');
  
      if (this.checked) {
        violentGraph.style.display = 'none';
        peacefulGraph.style.display = 'block';
      } else {
        violentGraph.style.display = 'block';
        peacefulGraph.style.display = 'none';
      }
    });
  });
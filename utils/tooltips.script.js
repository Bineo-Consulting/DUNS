module.exports = `
<script>
  function showTooltip(evt) {
    const CTM = svg.getScreenCTM();
    tooltip.setAttributeNS(null, "visibility", "visible");
    let x = (evt.clientX - CTM.e + 6) / CTM.a;
    let y = (evt.clientY - CTM.f + 20) / CTM.d;
    tooltip.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");
    let tooltipText = tooltip.getElementsByTagName('text')[0];
    tooltipText.firstChild.data = evt.target.getAttributeNS(null, "data-tooltip");
    let tooltipRects = tooltip.getElementsByTagName('rect');

    let length = tooltipText.getComputedTextLength();
    for (let i = 0; i < tooltipRects.length; i++) {
      tooltipRects[i].setAttributeNS(null, "width", length + 8);
    }
  }
  function hideTooltip() {
    tooltip.setAttributeNS(null, "visibility", "hidden");
  }
  const svg = document.querySelector('svg');

  const tooltip = document.getElementById('tooltip');
  const triggers = document.querySelectorAll('.active');
  for (let i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener('mousemove', showTooltip);
    triggers[i].addEventListener('mouseout', hideTooltip);
  }
</script>
`
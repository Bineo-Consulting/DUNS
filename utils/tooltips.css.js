module.exports = `<style>
.tooltip {
  position: relative;
}
.tooltip::after {
  background: rgba(48, 55, 66, .95);
  border-radius: 0.1rem;
  bottom: 100%;
  color: #fff;
  content: attr(data-tooltip);
  display: block;
  font-size: 1rem;
  left: 50%;
  max-width: 320px;
  opacity: 0;
  overflow: hidden;
  padding: 0.05rem 0.4rem;
  pointer-events: none;
  position: absolute;
  text-overflow: ellipsis;
  transform: translate(-50%, -0.2rem);
  transition: opacity 0.2s, transform 0.2s;
  white-space: pre;
  z-index: 300;
}
.tooltip:focus::after, .tooltip:hover::after {
  opacity: 1;
  transform: translate(-50%, 1rem);
}
.tooltip[disabled], .tooltip.disabled {
  pointer-events: auto;
}
.tooltip.tooltip-right::after {
  bottom: 50%;
  left: 100%;
  transform: translate(-0.2rem, 50%);
}
.tooltip.tooltip-right:focus::after, .tooltip.tooltip-right:hover::after {
  transform: translate(0.2rem, 50%);
}
.tooltip.tooltip-bottom::after {
  bottom: auto;
  top: 100%;
  transform: translate(-50%, -0.4rem);
}
.tooltip.tooltip-bottom:focus::after, .tooltip.tooltip-bottom:hover::after {
  transform: translate(-50%, 0.2rem);
}
.tooltip.tooltip-left::after {
  bottom: 50%;
  left: auto;
  right: 100%;
  transform: translate(0.4rem, 50%);
}
.tooltip.tooltip-left:focus::after, .tooltip.tooltip-left:hover::after {
  transform: translate(-0.2rem, 50%);
}
</style>`
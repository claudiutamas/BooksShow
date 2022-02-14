/*  FilePond - upload files using Drag&Drop
    For resize of Drag&Drop box I use CSS variables.
    But CSS loads after this file.
    To repair this, I read root styles befor running this file
*/

// Get styles from :root from the CSS file
const rootStyles = window.getComputedStyle(document.documentElement)

if (rootStyles.getPropertyValue('--book-cover-width-large') != null &&
  rootStyles.getPropertyValue('--book-cover-width-large') != '') {
  redy();
} else {
  document.getElementById('main-css')
    .addEventListener('load', redy)
}

function redy() {
  // Use parseFloat to transform Strig fom CSS to Float
  const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
  const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
  const coverHeight = coverWidth / coverAspectRatio;

  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )

  FilePond.setOptions({
    stylePanelAspectRatio: 1 / coverAspectRatio,
    imageResizeTargetWidth: coverWidth,
    imageResizeTargetHeight: coverHeight
  })

  // Turn all file input elements into ponds
  FilePond.parse(document.body);
}
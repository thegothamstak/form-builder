document.addEventListener('DOMContentLoaded', () => {
  const formCanvas = document.getElementById('form-canvas');
  const draggableButtons = document.querySelectorAll('[draggable=true]');

  // Enable dragstart
  draggableButtons.forEach(button => {
    button.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', button.textContent.trim());
    });
  });

  // Allow dropping
  formCanvas.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  // Handle drop
  formCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const element = createFormElement(type);
    if (element) formCanvas.appendChild(element);
  });
});

function createFormElement(type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative p-4 border rounded bg-white shadow space-y-2';

  const controls = document.createElement('div');
  controls.className = 'absolute top-1 right-1 space-x-2';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑';
  deleteBtn.className = 'text-red-500 hover:text-red-700';
  deleteBtn.addEventListener('click', () => wrapper.remove());

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.className = 'text-blue-500 hover:text-blue-700';
  editBtn.addEventListener('click', () => editField(wrapper));

  controls.appendChild(editBtn);
  controls.appendChild(deleteBtn);

  let input;
  switch (type) {
    case 'Text Input':
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Text Input';
      input.className = 'w-full px-3 py-2 border rounded';
      break;
    case 'Textarea':
      input = document.createElement('textarea');
      input.placeholder = 'Textarea';
      input.className = 'w-full px-3 py-2 border rounded';
      break;
    case 'Checkbox Group':
      input = document.createElement('div');
      input.innerHTML = `
        <label class="block"><input type="checkbox" class="mr-2"> Option 1</label>
        <label class="block"><input type="checkbox" class="mr-2"> Option 2</label>
      `;
      break;
    case 'Radio Group':
      input = document.createElement('div');
      input.innerHTML = `
        <label class="block"><input type="radio" name="radio-group" class="mr-2"> Option A</label>
        <label class="block"><input type="radio" name="radio-group" class="mr-2"> Option B</label>
      `;
      break;
    case 'File Upload':
      input = document.createElement('input');
      input.type = 'file';
      input.className = 'w-full';
      break;
    case 'Media Embed':
      input = document.createElement('iframe');
      input.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      input.className = 'w-full h-48';
      break;
    case 'Section Break':
      input = document.createElement('hr');
      input.className = 'my-4 border-t-2';
      break;
    case 'Page Break':
      input = document.createElement('div');
      input.innerHTML = '<hr class="my-8 border-t-4"><p class="text-center text-gray-400">--- Page Break ---</p>';
      break;
    default:
      return null;
  }

  wrapper.appendChild(controls);
  wrapper.appendChild(input);
  return wrapper;
}

function editField(wrapper) {
  const currentField = wrapper.querySelector('input, textarea, iframe');
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white p-6 rounded shadow w-96">
      <h2 class="text-lg font-semibold mb-4">Edit Field</h2>
      <label class="block mb-2">
        Label
        <input type="text" class="w-full px-3 py-2 border rounded" id="fieldLabel" value="${currentField.placeholder || ''}" />
      </label>
      <label class="block mb-2">
        <input type="checkbox" id="fieldRequired" class="mr-2" ${currentField.required ? 'checked' : ''} /> Required
      </label>
      <div class="flex justify-end space-x-2">
        <button id="cancelEdit" class="px-3 py-1 bg-gray-200 rounded">Cancel</button>
        <button id="saveEdit" class="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('cancelEdit').onclick = () => modal.remove();
  document.getElementById('saveEdit').onclick = () => {
    const newLabel = document.getElementById('fieldLabel').value;
    const isRequired = document.getElementById('fieldRequired').checked;

    if (currentField.placeholder !== undefined) currentField.placeholder = newLabel;
    currentField.required = isRequired;

    modal.remove();
  };
}

function previewForm() {
  const preview = document.getElementById('preview-content');
  preview.innerHTML = document.getElementById('form-canvas').innerHTML;
  document.getElementById('preview-overlay').classList.remove('hidden');
}

function closePreview() {
  document.getElementById('preview-overlay').classList.add('hidden');
}

function exportPDF() {
  const preview = document.getElementById('preview-content');
  html2canvas(preview).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('form.pdf');
  });
}

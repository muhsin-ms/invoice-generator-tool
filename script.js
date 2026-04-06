document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const themeToggle = document.getElementById('theme-toggle');
    const invoiceForm = document.getElementById('invoice-form');
    const invoicePreview = document.getElementById('invoice-preview');
    const printBtn = document.getElementById('print-btn');
    const downloadBtn = document.getElementById('download-btn');
    const addItemBtn = document.getElementById('add-item-btn');
    const itemsContainer = document.getElementById('items-container');
    const companyLogoInput = document.getElementById('company-logo');
    const logoImg = document.getElementById('logo-img');
    const logoPlaceholder = document.querySelector('.logo-placeholder');

    // Preview Elements
    const previewCompanyName = document.getElementById('preview-company-name');
    const previewCompanyAddress = document.getElementById('preview-company-address');
    const previewCompanyContact = document.getElementById('preview-company-contact');
    const footerCompanyName = document.getElementById('footer-company-name');
    
    const previewInvoiceNumber = document.getElementById('preview-invoice-number');
    const previewInvoiceDate = document.getElementById('preview-invoice-date');
    const previewDueDate = document.getElementById('preview-due-date');
    
    const previewClientName = document.getElementById('preview-client-name');
    const previewClientContact = document.getElementById('preview-client-contact');
    
    const invoiceItemsList = document.getElementById('invoice-items-list');
    
    const previewSubtotal = document.getElementById('preview-subtotal');
    const previewTaxPercent = document.getElementById('preview-tax-percent');
    const previewTaxAmount = document.getElementById('preview-tax-amount');
    const previewDiscountAmount = document.getElementById('preview-discount-amount');
    const previewGrandTotal = document.getElementById('preview-grand-total');
    
    const previewPaymentMethod = document.getElementById('preview-payment-method');
    const previewPaymentInstructions = document.getElementById('preview-payment-instructions');
    const previewNotes = document.getElementById('preview-notes');

    // State
    let isDark = false;
    let itemCount = 0;

    // Initialize with default values
    const init = () => {
        // Set dates
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 14); // Default 14 days due
        
        document.getElementById('invoice-date-input').value = today.toISOString().split('T')[0];
        document.getElementById('due-date-input').value = dueDate.toISOString().split('T')[0];
        
        // Generate Invoice Number
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const invNum = `INV-${today.getFullYear()}-${randomNum}`;
        document.getElementById('invoice-number-input').value = invNum;
        
        // Add first item
        addItem();
        
        // Initial preview update
        updatePreview();
    };

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        isDark = !isDark;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const icon = themeToggle.querySelector('i');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Logo Upload
    companyLogoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                logoImg.src = event.target.result;
                logoImg.style.display = 'block';
                logoPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Add Item Row
    function addItem() {
        itemCount++;
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.id = `item-row-${itemCount}`;
        itemRow.innerHTML = `
            <button type="button" class="remove-item" onclick="this.parentElement.remove(); updatePreview();">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="item-desc" placeholder="Product or Service" required>
            </div>
            <div class="item-row-inputs">
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" class="item-price" step="0.01" min="0" placeholder="0.00" value="0" required>
                </div>
                <div class="form-group">
                    <label>Qty</label>
                    <input type="number" class="item-qty" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Total</label>
                    <input type="text" class="item-total" value="$0.00" readonly>
                </div>
            </div>
        `;
        itemsContainer.appendChild(itemRow);

        // Add event listeners to new inputs
        const inputs = itemRow.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                calculateItemTotal(itemRow);
                updatePreview();
            });
        });
    }

    addItemBtn.addEventListener('click', addItem);

    function calculateItemTotal(row) {
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseInt(row.querySelector('.item-qty').value) || 0;
        const total = price * qty;
        row.querySelector('.item-total').value = `$${total.toFixed(2)}`;
    }

    // Update Preview Logic
    function updatePreview() {
        // Company Details
        previewCompanyName.textContent = document.getElementById('company-name').value || 'Your Company Name';
        previewCompanyAddress.textContent = document.getElementById('company-address').value || 'Company Address';
        previewCompanyContact.textContent = document.getElementById('company-contact').value || 'Contact Info';
        footerCompanyName.textContent = document.getElementById('company-name').value || 'Your Company Name';

        // Invoice Info
        previewInvoiceNumber.textContent = document.getElementById('invoice-number-input').value || 'INV-000';
        
        const dateVal = document.getElementById('invoice-date-input').value;
        previewInvoiceDate.textContent = dateVal ? new Date(dateVal).toLocaleDateString() : '--/--/----';
        
        const dueVal = document.getElementById('due-date-input').value;
        previewDueDate.textContent = dueVal ? new Date(dueVal).toLocaleDateString() : '--/--/----';

        // Client Details
        previewClientName.textContent = document.getElementById('client-name').value || 'Client Name';
        previewClientContact.textContent = document.getElementById('client-contact').value || 'Client Contact Details';

        // Payment & Notes
        const method = document.getElementById('payment-method').value;
        previewPaymentMethod.textContent = `Method: ${method.charAt(0).toUpperCase() + method.slice(1)}`;
        previewPaymentInstructions.textContent = document.getElementById('payment-instructions').value || 'No specific instructions.';
        previewNotes.textContent = document.getElementById('notes-input').value || 'Thank you for your business!';

        // Items and Calculations
        let subtotal = 0;
        invoiceItemsList.innerHTML = '';

        const rows = itemsContainer.querySelectorAll('.item-row');
        rows.forEach(row => {
            const desc = row.querySelector('.item-desc').value || 'Item Description';
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const qty = parseInt(row.querySelector('.item-qty').value) || 0;
            const total = price * qty;
            subtotal += total;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${desc}</td>
                <td class="text-center">${qty}</td>
                <td class="text-right">$${price.toFixed(2)}</td>
                <td class="text-right">$${total.toFixed(2)}</td>
            `;
            invoiceItemsList.appendChild(tr);
        });

        if (rows.length === 0) {
            invoiceItemsList.innerHTML = '<tr><td colspan="4" class="text-center">No items added</td></tr>';
        }

        // Totals
        const taxPercent = parseFloat(document.getElementById('tax-input').value) || 0;
        const discount = parseFloat(document.getElementById('discount-input').value) || 0;
        
        const taxAmount = (subtotal * taxPercent) / 100;
        const grandTotal = subtotal + taxAmount - discount;

        previewSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        previewTaxPercent.textContent = taxPercent;
        previewTaxAmount.textContent = `$${taxAmount.toFixed(2)}`;
        previewDiscountAmount.textContent = `-$${discount.toFixed(2)}`;
        previewGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
    }

    // Form submission
    invoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updatePreview();
        
        // Scroll to preview on mobile
        if (window.innerWidth <= 1100) {
            document.querySelector('.preview-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Add listeners for other inputs for live update
    const liveInputs = [
        'company-name', 'company-address', 'company-contact',
        'invoice-number-input', 'invoice-date-input', 'due-date-input',
        'client-name', 'client-contact', 'tax-input', 'discount-input',
        'payment-method', 'payment-instructions', 'notes-input'
    ];

    liveInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    // Print & Download
    printBtn.addEventListener('click', () => {
        window.print();
    });

    downloadBtn.addEventListener('click', () => {
        const element = document.getElementById('invoice-preview');
        const invNum = document.getElementById('invoice-number-input').value || 'invoice';
        
        const options = {
            margin: 0,
            filename: `${invNum.toLowerCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(options).save();
    });

    // Start the app
    init();
});

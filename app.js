class ServiceManagementSystem {
    constructor() {
        this.services = JSON.parse(localStorage.getItem("services")) || [
            { 
                id: 1, 
                name: "طراحی وبسایت", 
                price: 5000000, 
                description: "طراحی و توسعه وبسایت اختصاصی",
                category: "طراحی"
            },
            { 
                id: 2, 
                name: "مشاوره فنی", 
                price: 800000, 
                description: "مشاوره تخصصی در زمینه فناوری اطلاعات",
                category: "مشاوره"
            },
            { 
                id: 3, 
                name: "پشتیبانی ماهانه", 
                price: 1000000, 
                description: "پشتیبانی و نگهداری ماهانه سیستم",
                category: "پشتیبانی"
            }
        ];
        this.invoices = JSON.parse(localStorage.getItem("invoices")) || [];
        this.invoiceNumber = Number(localStorage.getItem("invoiceNumber")) || 1;
        this.container = document.getElementById("services");
    }

    init() {
        this.renderServices();
        this.renderHistory();
        this.setupEventListeners();
        this.setupGlobalFunctions();
    }

    setupEventListeners() {
        // رویداد کلیک برای دکمه افزودن سرویس
        const addServiceBtn = document.getElementById('addServiceBtn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addService();
            });
        }

        // رویداد کلیک برای دکمه صدور فاکتور
        const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
        if (generateInvoiceBtn) {
            generateInvoiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateInvoice();
            });
        }

        // رویداد input برای محاسبه خودکار جمع کل
        document.addEventListener('input', (e) => {
            if (e.target.id && (e.target.id.startsWith('qty-') || e.target.id.startsWith('price-'))) {
                this.calculateTotal();
            }
        });

        // رویداد change برای چک‌باکس‌ها
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.calculateTotal();
            }
        });

        // رویداد keypress برای Enter در فیلدهای سرویس جدید
        const newServiceName = document.getElementById('newServiceName');
        if (newServiceName) {
            newServiceName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addService();
                }
            });
        }

        const newServicePrice = document.getElementById('newServicePrice');
        if (newServicePrice) {
            newServicePrice.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addService();
                }
            });
        }

        // رویداد keypress برای Enter در فیلدهای مشتری
        const customerName = document.getElementById('customerName');
        if (customerName) {
            customerName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.generateInvoice();
                }
            });
        }

        const customerPhone = document.getElementById('customerPhone');
        if (customerPhone) {
            customerPhone.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.generateInvoice();
                }
            });
        }
    }

    setupGlobalFunctions() {
        // تنظیم توابع جهانی
        window.serviceSystem = this;
        window.clearAllData = () => this.clearAllData();
        window.exportData = () => this.exportData();
        window.importData = () => this.openImportDialog();
    }

    save() {
        localStorage.setItem("services", JSON.stringify(this.services));
        localStorage.setItem("invoices", JSON.stringify(this.invoices));
        localStorage.setItem("invoiceNumber", this.invoiceNumber);
    }

    showAlert(message, type = 'success') {
        const alert = document.getElementById('alert');
        if (!alert) return;
        
        alert.textContent = message;
        alert.className = `alert ${type}`;
        alert.classList.add('show');
        
        setTimeout(() => {
            alert.classList.remove('show');
        }, 3000);
    }

    renderServices() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (this.services.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-list-ul'></i>
                    <p>هیچ سرویسی ثبت نشده است</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">برای شروع، اولین سرویس خود را اضافه کنید</p>
                </div>
            `;
            return;
        }
        
        this.services.forEach((service, index) => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'service-item';
            
            serviceElement.innerHTML = `
                <div class="service-info">
                    <h4>${service.name}</h4>
                    <div class="service-price">${service.price.toLocaleString('fa-IR')} ریال</div>
                    ${service.description ? `<div class="description">${service.description}</div>` : ''}
                </div>
                <input type="number" 
                       id="price-${index}" 
                       class="service-input" 
                       value="${service.price}" 
                       min="0"
                       placeholder="قیمت (ریال)">
                <input type="number" 
                       id="qty-${index}" 
                       class="service-input" 
                       value="0" 
                       min="0"
                       placeholder="تعداد">
                <input type="checkbox" 
                       class="service-checkbox">
                <div class="service-actions" style="display: none;">
                    <button type="button" class="action-btn delete-btn" data-service-id="${service.id}">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            `;
            
            // اضافه کردن event listener برای دکمه حذف
            const deleteBtn = serviceElement.querySelector('.action-btn.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const serviceId = parseInt(deleteBtn.getAttribute('data-service-id'));
                    this.deleteService(serviceId);
                });
            }
            
            // نمایش دکمه‌های مدیریت در صورت hover
            serviceElement.addEventListener('mouseenter', () => {
                const actions = serviceElement.querySelector('.service-actions');
                if (actions) actions.style.display = 'block';
            });
            
            serviceElement.addEventListener('mouseleave', () => {
                const actions = serviceElement.querySelector('.service-actions');
                if (actions) actions.style.display = 'none';
            });
            
            this.container.appendChild(serviceElement);
        });
        
        this.calculateTotal();
    }

    addService() {
        const nameInput = document.getElementById("newServiceName");
        const priceInput = document.getElementById("newServicePrice");
        const descriptionInput = document.getElementById("newServiceDescription");
        
        if (!nameInput || !priceInput || !descriptionInput) {
            this.showAlert("خطا در بارگذاری فرم!", "error");
            return;
        }
        
        const name = nameInput.value.trim();
        const price = Number(priceInput.value);
        const description = descriptionInput.value.trim();

        if (!name) {
            this.showAlert("نام سرویس الزامی است!", "error");
            nameInput.focus();
            return;
        }

        if (price <= 0 || isNaN(price)) {
            this.showAlert("قیمت باید بیشتر از صفر باشد!", "error");
            priceInput.focus();
            return;
        }

        const newService = {
            id: Date.now(),
            name,
            price: price,
            description: description || "",
            category: "عمومی"
        };

        this.services.push(newService);
        this.save();
        this.renderServices();

        // پاک کردن فیلدها
        nameInput.value = "";
        priceInput.value = "";
        descriptionInput.value = "";

        // فوکوس روی فیلد نام
        nameInput.focus();

        this.showAlert("سرویس با موفقیت اضافه شد!");
    }

    deleteService(serviceId) {
        if (confirm("آیا از حذف این سرویس اطمینان دارید؟")) {
            const index = this.services.findIndex(service => service.id === serviceId);
            if (index !== -1) {
                this.services.splice(index, 1);
                this.save();
                this.renderServices();
                this.showAlert("سرویس با موفقیت حذف شد!");
            }
        }
    }

    calculateTotal() {
        let total = 0;

        this.services.forEach((service, index) => {
            const qtyInput = document.getElementById(`qty-${index}`);
            const priceInput = document.getElementById(`price-${index}`);
            const checkbox = document.querySelectorAll('.service-checkbox')[index];
            
            if (qtyInput && priceInput && checkbox) {
                const qty = Number(qtyInput.value) || 0;
                const price = Number(priceInput.value) || 0;
                
                // اعتبارسنجی تعداد
                if (qty < 0) {
                    qtyInput.value = 0;
                }
                
                // اعتبارسنجی قیمت
                if (price < 0) {
                    priceInput.value = service.price;
                }
                
                // به‌روزرسانی قیمت سرویس در صورت تغییر
                if (service.price !== price && price > 0) {
                    service.price = price;
                    this.save();
                }
                
                if (checkbox.checked) {
                    total += qty * price;
                }
            }
        });

        const totalElement = document.getElementById("total");
        if (totalElement) {
            totalElement.innerHTML = `
                <i class='bx bx-calculator'></i>
                جمع کل: ${total.toLocaleString('fa-IR')} ریال
            `;
        }
    }

    generateInvoice() {
        const nameInput = document.getElementById("customerName");
        const phoneInput = document.getElementById("customerPhone");
        const notesInput = document.getElementById("customerNotes");
        
        if (!nameInput || !phoneInput || !notesInput) {
            this.showAlert("خطا در بارگذاری فرم مشتری!", "error");
            return;
        }
        
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const notes = notesInput.value.trim();
        const items = [];
        let total = 0;

        this.services.forEach((service, index) => {
            const qtyInput = document.getElementById(`qty-${index}`);
            const checkbox = document.querySelectorAll('.service-checkbox')[index];
            
            if (!qtyInput || !checkbox) return;
            
            const qty = Number(qtyInput.value) || 0;

            if (checkbox.checked && qty > 0) {
                const subtotal = qty * service.price;
                total += subtotal;

                items.push({
                    name: service.name,
                    quantity: qty,
                    price: service.price,
                    description: service.description,
                    subtotal
                });
            }
        });

        if (items.length === 0) {
            this.showAlert("لطفا حداقل یک سرویس انتخاب کنید!", "error");
            return;
        }

        const invoice = {
            number: this.invoiceNumber++,
            customer: name || "مشتری ناشناس",
            phone: phone || "ثبت نشده",
            notes: notes || "",
            date: new Date().toLocaleString('fa-IR'),
            items,
            total
        };

        this.invoices.unshift(invoice);
        this.save();
        this.renderHistory();

        // پاک کردن فیلدهای مشتری و توضیحات
        nameInput.value = "";
        phoneInput.value = "";
        notesInput.value = "";

        // پاک کردن مقادیر سرویس‌ها
        this.services.forEach((service, index) => {
            const qtyInput = document.getElementById(`qty-${index}`);
            const checkbox = document.querySelectorAll('.service-checkbox')[index];
            if (qtyInput) qtyInput.value = 0;
            if (checkbox) checkbox.checked = false;
        });

        this.calculateTotal();
        this.showAlert(`فاکتور خدمات شماره ${invoice.number} با موفقیت صادر شد!`);
    }

    renderHistory() {
        const historyContainer = document.getElementById("history");
        if (!historyContainer) return;
        
        historyContainer.innerHTML = '';

        if (this.invoices.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-info-circle'></i>
                    <p>هیچ فاکتوری ثبت نشده است</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">پس از صدور فاکتور، تاریخچه اینجا نمایش داده می‌شود</p>
                </div>
            `;
            return;
        }

        this.invoices.forEach(invoice => {
            const invoiceElement = document.createElement('div');
            invoiceElement.className = 'invoice-item';

            invoiceElement.innerHTML = `
                <div class="invoice-header">
                    <strong>فاکتور خدمات #${invoice.number}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px;">
                        <i class='bx bx-calendar'></i> ${invoice.date}
                    </div>
                </div>
                <div style="margin: var(--spacing-md) 0; text-align: center;">
                    <div><i class='bx bx-user'></i> ${invoice.customer}</div>
                    <div><i class='bx bx-phone'></i> ${invoice.phone}</div>
                </div>
                ${invoice.notes ? `
                    <div class="invoice-notes">
                        <i class='bx bx-note'></i> ${invoice.notes}
                    </div>
                ` : ''}
                <div class="invoice-items">
                    ${invoice.items.map(item => `
                        <div class="invoice-item-row">
                            <div style="text-align: right; flex: 1;">
                                <div style="color: var(--text-primary); font-weight: 500;">${item.name}</div>
                                ${item.description ? `<div style="font-size: 0.8rem; color: var(--text-secondary);">${item.description}</div>` : ''}
                            </div>
                            <div style="text-align: left; flex: 1;">
                                ${item.quantity} عدد × ${item.price.toLocaleString('fa-IR')} ریال
                            </div>
                            <div style="text-align: left; flex: 1; color: var(--accent-success); font-weight: bold;">
                                ${item.subtotal.toLocaleString('fa-IR')} ریال
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="invoice-total">
                    <i class='bx bx-credit-card'></i>
                    مبلغ نهایی: ${invoice.total.toLocaleString('fa-IR')} ریال
                </div>
            `;

            historyContainer.appendChild(invoiceElement);
        });
    }

    // متدهای کمکی برای مدیریت بهتر
    clearAllData() {
        if (confirm("آیا از پاک کردن تمام داده‌ها اطمینان دارید؟\nاین عمل قابل بازگشت نیست.")) {
            localStorage.clear();
            this.services = [];
            this.invoices = [];
            this.invoiceNumber = 1;
            this.save();
            this.renderServices();
            this.renderHistory();
            this.showAlert("تمامی داده‌ها با موفقیت پاک شدند.");
        }
    }

    exportData() {
        const data = {
            services: this.services,
            invoices: this.invoices,
            invoiceNumber: this.invoiceNumber,
            exportDate: new Date().toISOString(),
            systemType: "Service Management System"
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `service-system-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showAlert("داده‌های سیستم خدمات با موفقیت دانلود شدند.");
    }

    openImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
            }
        };
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.systemType !== "Service Management System") {
                    this.showAlert("فایل وارد شده معتبر نیست!", "error");
                    return;
                }
                
                this.services = data.services || [];
                this.invoices = data.invoices || [];
                this.invoiceNumber = data.invoiceNumber || 1;
                
                this.save();
                this.renderServices();
                this.renderHistory();
                
                this.showAlert("داده‌ها با موفقیت وارد شدند!");
            } catch (error) {
                this.showAlert("خطا در خواندن فایل!", "error");
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
}

// ایجاد نمونه از سیستم مدیریت خدمات و مقداردهی اولیه
document.addEventListener('DOMContentLoaded', function() {
    const serviceSystem = new ServiceManagementSystem();
    serviceSystem.init();
    
    // ایجاد دکمه‌های مدیریت در پایین صفحه
    const centerContainer = document.querySelector('.center-container');
    if (centerContainer) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'actions-container';
        actionsContainer.innerHTML = `
            <button type="button" class="action-btn" id="exportBtn">
                <i class='bx bx-export'></i> خروجی گرفتن
            </button>
            <button type="button" class="action-btn" id="importBtn">
                <i class='bx bx-import'></i> وارد کردن
            </button>
            <button type="button" class="action-btn delete-btn" id="clearBtn">
                <i class='bx bx-trash'></i> پاک کردن همه داده‌ها
            </button>
        `;
        
        // اضافه کردن event listeners به دکمه‌های مدیریت
        const exportBtn = actionsContainer.querySelector('#exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                serviceSystem.exportData();
            });
        }
        
        const importBtn = actionsContainer.querySelector('#importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', (e) => {
                e.preventDefault();
                serviceSystem.openImportDialog();
            });
        }
        
        const clearBtn = actionsContainer.querySelector('#clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                serviceSystem.clearAllData();
            });
        }
        
        centerContainer.appendChild(actionsContainer);
    }
});

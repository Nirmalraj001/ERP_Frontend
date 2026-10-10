import * as XLSX from 'xlsx'

export type ModuleKey = 'VENDORS' | 'PURCHASE_ORDERS' | 'REQUISITIONS' | 'ITEMS' | 'GOODS_RECEIPTS' | 'INVOICES'

export interface ColumnDefinition {
  key: string
  label: string
  required?: boolean
  type?: 'string' | 'number' | 'email' | 'date'
  description?: string
  sample?: string | number
}

export interface ModuleImportConfig {
  key: ModuleKey
  title: string
  subtitle: string
  endpoint: string
  templateFilename: string
  columns: ColumnDefinition[]
  sampleData: Record<string, any>[]
  payloadWrapperKey: string
}

export const MODULE_CONFIGS: Record<ModuleKey, ModuleImportConfig> = {
  VENDORS: {
    key: 'VENDORS',
    title: 'Vendors & Suppliers',
    subtitle: 'Bulk onboard approved supplier master accounts, banking coordinates, and trade terms.',
    endpoint: '/vendors/bulk-import',
    templateFilename: 'SLT_Vendors_Import_Template.xlsx',
    payloadWrapperKey: 'vendors',
    columns: [
      { key: 'vendorCode', label: 'Vendor Code', type: 'string', description: 'Optional unique vendor code (e.g., VND-001)', sample: 'VND-001' },
      { key: 'name', label: 'Company Legal Name', required: true, type: 'string', description: 'Mandatory registered corporate entity name', sample: 'Tata Steel BSL Limited' },
      { key: 'category', label: 'Trade Category', type: 'string', description: 'e.g. Structural Steel, Electrical, Heavy Pumps, Lubricants', sample: 'Structural Steel' },
      { key: 'type', label: 'Vendor Type', type: 'string', description: 'e.g. Manufacturer, Authorized OEM, Distributor', sample: 'Manufacturer' },
      { key: 'email', label: 'Official Email', required: true, type: 'email', description: 'Corporate procurement correspondence email', sample: 'b2b.sales@tatasteel.com' },
      { key: 'phone', label: 'Contact Phone', type: 'string', description: 'Primary phone with country code (+91)', sample: '+91-22-6665-8282' },
      { key: 'city', label: 'City', type: 'string', description: 'Operating headquarters city', sample: 'Mumbai, Maharashtra' },
      { key: 'country', label: 'Country', type: 'string', description: 'Country of registration', sample: 'India' },
      { key: 'creditTerms', label: 'Credit Terms', type: 'string', description: 'Payment settlement terms (e.g. Net 30, Net 45)', sample: 'Net 30' },
      { key: 'taxId', label: 'Tax ID / GSTIN', type: 'string', description: '15-digit Indian GSTIN number', sample: '27AAACT2727Q1ZW' },
      { key: 'contactPerson', label: 'Primary Contact Person', type: 'string', description: 'Full name of account executive', sample: 'Rajesh Nair' },
      { key: 'bankName', label: 'Bank Name', type: 'string', description: 'Primary settlement bank', sample: 'State Bank of India' },
      { key: 'bankAccount', label: 'Bank Account No', type: 'string', description: 'Corporate current account number', sample: '40918239012' },
    ],
    sampleData: [
      {
        vendorCode: 'VND-001',
        name: 'Tata Steel BSL Limited',
        category: 'Structural Steel & Heavy Alloys',
        type: 'Manufacturer',
        email: 'b2b.sales@tatasteel.com',
        phone: '+91-22-6665-8282',
        city: 'Mumbai, Maharashtra',
        country: 'India',
        creditTerms: 'Net 30',
        taxId: '27AAACT2727Q1ZW',
        contactPerson: 'Rajesh Nair',
        bankName: 'State Bank of India',
        bankAccount: '40918239012',
      },
      {
        vendorCode: 'VND-002',
        name: 'Larsen & Toubro Electrical & Automation Ltd',
        category: 'Switchgear & Industrial Automation',
        type: 'Manufacturer',
        email: 'orders.ea@larsentoubro.com',
        phone: '+91-265-245-1200',
        city: 'Vadodara, Gujarat',
        country: 'India',
        creditTerms: 'Net 45',
        taxId: '24AAACL0140P1ZT',
        contactPerson: 'Ananya Deshmukh',
        bankName: 'HDFC Bank',
        bankAccount: '5020008819201',
      },
      {
        vendorCode: 'VND-003',
        name: 'Kirloskar Brothers Limited',
        category: 'Industrial Pumps, Valves & Flow Control',
        type: 'Manufacturer',
        email: 'corporate.sales@kbl.co.in',
        phone: '+91-20-2721-4000',
        city: 'Pune, Maharashtra',
        country: 'India',
        creditTerms: 'Net 30',
        taxId: '27AAACK1188D1Z2',
        contactPerson: 'Milind Joshi',
        bankName: 'ICICI Bank',
        bankAccount: '003905001188',
      },
      {
        vendorCode: 'VND-004',
        name: 'Indian Oil Corporation Ltd (Lubricants Division)',
        category: 'Industrial Lubricants & Petroleum',
        type: 'Public Sector Undertaking',
        email: 'servolubes@indianoil.in',
        phone: '+91-22-2644-7611',
        city: 'Mumbai, Maharashtra',
        country: 'India',
        creditTerms: 'Net 30',
        taxId: '27AAACI1681G1ZM',
        contactPerson: 'Sandeep Verma',
        bankName: 'Punjab National Bank',
        bankAccount: '112000210089',
      },
    ],
  },

  PURCHASE_ORDERS: {
    key: 'PURCHASE_ORDERS',
    title: 'Purchase Orders',
    subtitle: 'Upload and issue batch purchase orders with delivery milestones and item prices.',
    endpoint: '/purchase-orders/bulk-import',
    templateFilename: 'SLT_Purchase_Orders_Import_Template.xlsx',
    payloadWrapperKey: 'orders',
    columns: [
      { key: 'poNumber', label: 'PO Number', type: 'string', description: 'Optional unique PO code (e.g. PO-2026-00441)', sample: 'PO-2026-00441' },
      { key: 'vendorCodeOrName', label: 'Vendor Code or Name', required: true, type: 'string', description: 'Registered vendor name or code', sample: 'Tata Steel BSL Limited' },
      { key: 'type', label: 'PO Type', type: 'string', description: 'Single, Multi, Blanket, Open', sample: 'Single' },
      { key: 'orderDate', label: 'Order Date', type: 'date', description: 'Format: YYYY-MM-DD', sample: '2026-10-12' },
      { key: 'deliveryDate', label: 'Expected Delivery Date', required: true, type: 'date', description: 'Format: YYYY-MM-DD', sample: '2026-11-05' },
      { key: 'paymentTerms', label: 'Payment Terms', type: 'string', description: 'e.g. Net 30, Net 45', sample: 'Net 30' },
      { key: 'itemDescription', label: 'Item Description', required: true, type: 'string', description: 'Scope or description of procured items', sample: 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)' },
      { key: 'quantity', label: 'Quantity', required: true, type: 'number', description: 'Positive numeric count', sample: 50 },
      { key: 'unitPrice', label: 'Unit Price (₹)', required: true, type: 'number', description: 'Contracted unit price in INR', sample: 4850 },
      { key: 'taxRate', label: 'GST Rate (%)', type: 'number', description: 'Applicable GST percentage (typically 18%)', sample: 18 },
      { key: 'notes', label: 'Order Notes', type: 'string', description: 'Inspection requirements or logistics memo', sample: 'Deliver directly to Bay 4 Receiving Dock, Pune Plant 102. Mill Test Certificate mandatory.' },
    ],
    sampleData: [
      {
        poNumber: 'PO-2026-00441',
        vendorCodeOrName: 'Tata Steel BSL Limited',
        type: 'Single',
        orderDate: '2026-10-12',
        deliveryDate: '2026-11-05',
        paymentTerms: 'Net 30',
        itemDescription: 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)',
        quantity: 50,
        unitPrice: 4850,
        taxRate: 18,
        notes: 'Deliver directly to Bay 4 Receiving Dock, Pune Plant 102. Mill Test Certificate mandatory.',
      },
      {
        poNumber: 'PO-2026-00442',
        vendorCodeOrName: 'Larsen & Toubro Electrical & Automation Ltd',
        type: 'Multi',
        orderDate: '2026-10-14',
        deliveryDate: '2026-11-12',
        paymentTerms: 'Net 45',
        itemDescription: 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
        quantity: 4,
        unitPrice: 142000,
        taxRate: 18,
        notes: 'Ship via registered express carrier to Bengaluru Tech Hub. Mark crates with PO-2026-00442.',
      },
      {
        poNumber: 'PO-2026-00443',
        vendorCodeOrName: 'Kirloskar Brothers Limited',
        type: 'Single',
        orderDate: '2026-10-15',
        deliveryDate: '2026-11-01',
        paymentTerms: 'Net 30',
        itemDescription: 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
        quantity: 3,
        unitPrice: 88500,
        taxRate: 18,
        notes: 'Delivery to Chennai Hub Central Stores. Include motor test certificates and warranty card.',
      },
      {
        poNumber: 'PO-2026-00444',
        vendorCodeOrName: 'Indian Oil Corporation Ltd (Lubricants Division)',
        type: 'Single',
        orderDate: '2026-10-16',
        deliveryDate: '2026-11-08',
        paymentTerms: 'Net 30',
        itemDescription: 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
        quantity: 4,
        unitPrice: 38400,
        taxRate: 18,
        notes: 'Deliver 4 sealed drums to Lubricants Basement Storage, Pune Works.',
      },
    ],
  },

  REQUISITIONS: {
    key: 'REQUISITIONS',
    title: 'Purchase Requisitions',
    subtitle: 'Upload departmental purchase requisitions with estimated budgets and line items.',
    endpoint: '/requisitions/bulk-import',
    templateFilename: 'SLT_Requisitions_Import_Template.xlsx',
    payloadWrapperKey: 'requisitions',
    columns: [
      { key: 'prNumber', label: 'PR Number', type: 'string', description: 'Optional unique PR number', sample: 'PR-2026-00101' },
      { key: 'title', label: 'Requisition Title', required: true, type: 'string', description: 'Descriptive title of requisition', sample: 'Urgent Structural Steel Hollow Sections for Line 4 Expansion' },
      { key: 'department', label: 'Department / Cost Center', required: true, type: 'string', description: 'Requesting department name', sample: 'Manufacturing Operations' },
      { key: 'priority', label: 'Priority', type: 'string', description: 'LOW, MEDIUM, HIGH, URGENT', sample: 'HIGH' },
      { key: 'itemDescription', label: 'Item Description', required: true, type: 'string', description: 'Material specifications', sample: 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)' },
      { key: 'quantity', label: 'Quantity', required: true, type: 'number', description: 'Order quantity', sample: 50 },
      { key: 'estimatedUnitPrice', label: 'Est. Unit Price (₹)', required: true, type: 'number', description: 'Budgeted unit cost in INR', sample: 4850 },
      { key: 'uom', label: 'Unit of Measure', type: 'string', description: 'EA, DRUM, KG, MTR, SET', sample: 'MTR' },
      { key: 'requiredByDate', label: 'Required By Date', required: true, type: 'date', description: 'Format: YYYY-MM-DD', sample: '2026-10-30' },
      { key: 'purpose', label: 'Procurement Purpose', type: 'string', description: 'Business justification', sample: 'Line 4 structural mezzanine fabrication scheduled for mid-month' },
    ],
    sampleData: [
      {
        prNumber: 'PR-2026-00101',
        title: 'Urgent Structural Steel Hollow Sections for Line 4 Expansion',
        department: 'Manufacturing Operations',
        priority: 'HIGH',
        itemDescription: 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)',
        quantity: 50,
        estimatedUnitPrice: 4850,
        uom: 'MTR',
        requiredByDate: '2026-10-30',
        purpose: 'Line 4 structural mezzanine fabrication scheduled for mid-month. Approved under Q1 capital budget.',
      },
      {
        prNumber: 'PR-2026-00102',
        title: 'L&T 45kW VFD Units for Chiller Plant Energy Optimization',
        department: 'Automation & Instrumentation',
        priority: 'MEDIUM',
        itemDescription: 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
        quantity: 4,
        estimatedUnitPrice: 142000,
        uom: 'EA',
        requiredByDate: '2026-11-10',
        purpose: 'Replacement of older rewound motors with energy efficient VFD speed drives in plant chiller room.',
      },
      {
        prNumber: 'PR-2026-00103',
        title: 'Kirloskar DB 65/26 Centrifugal Pump Sets for ETP Plant',
        department: 'Facilities & Logistics',
        priority: 'HIGH',
        itemDescription: 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
        quantity: 3,
        estimatedUnitPrice: 88500,
        uom: 'SET',
        requiredByDate: '2026-10-25',
        purpose: 'Effluent treatment plant pump refurbishment for state pollution control board compliance audit.',
      },
      {
        prNumber: 'PR-2026-00104',
        title: 'Servo System 68 Anti-Wear Hydraulic Fluid Barrels Replenishment',
        department: 'Manufacturing Operations',
        priority: 'MEDIUM',
        itemDescription: 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
        quantity: 4,
        estimatedUnitPrice: 38400,
        uom: 'DRUM',
        requiredByDate: '2026-11-05',
        purpose: 'Scheduled semi-annual hydraulic oil change for hydraulic presses 1 through 4.',
      },
    ],
  },

  ITEMS: {
    key: 'ITEMS',
    title: 'Item Master Catalog',
    subtitle: 'Import standard item definitions, category tags, safety stock limits, and standard prices.',
    endpoint: '/items/bulk-import',
    templateFilename: 'SLT_Item_Master_Import_Template.xlsx',
    payloadWrapperKey: 'items',
    columns: [
      { key: 'itemCode', label: 'Item Code', required: true, type: 'string', description: 'Unique material code (e.g. ITM-IS2062-E250)', sample: 'ITM-IS2062-E250' },
      { key: 'name', label: 'Item Name & Specification', required: true, type: 'string', description: 'Full technical descriptor', sample: 'Tata Structura MS Hollow Sections & Heavy Beams (IS 2062 E250BR)' },
      { key: 'category', label: 'Category', type: 'string', description: 'e.g. Structural Steel, Electrical, Heavy Pumps, Lubricants', sample: 'Structural Steel & Heavy Alloys' },
      { key: 'uom', label: 'Unit of Measure', required: true, type: 'string', description: 'EA, KG, MTR, SET, DRUM', sample: 'MTR' },
      { key: 'standardPrice', label: 'Standard Price (₹)', required: true, type: 'number', description: 'Benchmark purchasing cost in INR', sample: 4850 },
      { key: 'minStock', label: 'Min Safety Stock', type: 'number', description: 'Minimum reorder threshold', sample: 25 },
      { key: 'currentStock', label: 'Current Warehouse Stock', type: 'number', description: 'On-hand quantity', sample: 80 },
      { key: 'description', label: 'Technical Details', type: 'string', description: 'Material grade, tolerance specifications', sample: 'Hot rolled high-strength structural steel square hollow section (150x150x6mm, 6m length) certified to IS 2062' },
    ],
    sampleData: [
      {
        itemCode: 'ITM-IS2062-E250',
        name: 'Tata Structura MS Hollow Sections & Heavy Beams (IS 2062 E250BR)',
        category: 'Structural Steel & Heavy Alloys',
        uom: 'MTR',
        standardPrice: 4850,
        minStock: 25,
        currentStock: 80,
        description: 'Hot rolled high-strength structural steel square hollow section (150x150x6mm, 6m length) certified to IS 2062',
      },
      {
        itemCode: 'ITM-LNT-VFD',
        name: 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
        category: 'Switchgear, Electrical & Instrumentation',
        uom: 'EA',
        standardPrice: 142000,
        minStock: 5,
        currentStock: 14,
        description: 'Larsen & Toubro Sx2000 series 45kW AC drive with built-in EMC filter, RS-485 Modbus, IP55 rugged enclosure',
      },
      {
        itemCode: 'ITM-KBL-PUMP',
        name: 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
        category: 'Industrial Pumps, Valves & Flow Control',
        uom: 'SET',
        standardPrice: 88500,
        minStock: 3,
        currentStock: 8,
        description: 'Heavy duty back pull-out centrifugal water pump with high-efficiency IE3 motor, bronze impeller, 120 m3/hr flow',
      },
      {
        itemCode: 'ITM-IOCL-VG68',
        name: 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
        category: 'Industrial Lubricants & Consumables',
        uom: 'DRUM',
        standardPrice: 38400,
        minStock: 15,
        currentStock: 45,
        description: 'Indian Oil SERVO SYSTEM 68 high viscosity index anti-wear hydraulic oil conforming to IS 10522:1983 standards',
      },
    ],
  },

  GOODS_RECEIPTS: {
    key: 'GOODS_RECEIPTS',
    title: 'Goods Receipt Notes (GRN)',
    subtitle: 'Record batch dock receipts, carrier challans, and physical inventory intake logs.',
    endpoint: '/goods-receipts/bulk-import',
    templateFilename: 'SLT_Goods_Receipt_Import_Template.xlsx',
    payloadWrapperKey: 'receipts',
    columns: [
      { key: 'grnNumber', label: 'GRN Number', type: 'string', description: 'Optional unique GRN code', sample: 'GRN-2026-00219' },
      { key: 'poNumber', label: 'PO Reference Number', required: true, type: 'string', description: 'Target purchase order number', sample: 'PO-2026-00441' },
      { key: 'vendorName', label: 'Vendor Name', type: 'string', description: 'Issuing supplier name', sample: 'Tata Steel BSL Limited' },
      { key: 'deliveryNoteNumber', label: 'Delivery Challan / Note No', required: true, type: 'string', description: 'Physical dispatch challan number', sample: 'DC-TATA-44102' },
      { key: 'vehicleNumber', label: 'Carrier / Vehicle No', type: 'string', description: 'Truck registration number', sample: 'MH-12-RN-8821' },
      { key: 'receiptDate', label: 'Receipt Date', type: 'date', description: 'Format: YYYY-MM-DD', sample: '2026-10-10' },
      { key: 'itemDescription', label: 'Received Item Description', required: true, type: 'string', description: 'Received material line item', sample: 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)' },
      { key: 'quantityReceived', label: 'Quantity Received', required: true, type: 'number', description: 'Physical count verified at receiving dock', sample: 50 },
      { key: 'remarks', label: 'Inspection Notes', type: 'string', description: 'Dock quality report remarks', sample: 'All 50 meters structural hollow sections inspected, gauge verified, mill test cert logged.' },
    ],
    sampleData: [
      {
        grnNumber: 'GRN-2026-00219',
        poNumber: 'PO-2026-00441',
        vendorName: 'Tata Steel BSL Limited',
        deliveryNoteNumber: 'DC-TATA-44102',
        vehicleNumber: 'MH-12-RN-8821',
        receiptDate: '2026-10-10',
        itemDescription: 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)',
        quantityReceived: 50,
        remarks: 'All 50 meters structural hollow sections inspected, gauge verified, mill test cert logged.',
      },
      {
        grnNumber: 'GRN-2026-00220',
        poNumber: 'PO-2026-00442',
        vendorName: 'Larsen & Toubro Electrical & Automation Ltd',
        deliveryNoteNumber: 'DC-LT-99120',
        vehicleNumber: 'GJ-06-TT-5021',
        receiptDate: '2026-10-09',
        itemDescription: 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
        quantityReceived: 4,
        remarks: '4 VFD panels received intact in original moisture-barrier packaging. Serial numbers recorded.',
      },
      {
        grnNumber: 'GRN-2026-00221',
        poNumber: 'PO-2026-00443',
        vendorName: 'Kirloskar Brothers Limited',
        deliveryNoteNumber: 'DC-KBL-77401',
        vehicleNumber: 'MH-14-AZ-6619',
        receiptDate: '2026-10-11',
        itemDescription: 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
        quantityReceived: 3,
        remarks: '3 pump skids unloaded at Chennai stores. Impeller rotation checked freely by mechanical engineer.',
      },
      {
        grnNumber: 'GRN-2026-00222',
        poNumber: 'PO-2026-00444',
        vendorName: 'Indian Oil Corporation Ltd (Lubricants Division)',
        deliveryNoteNumber: 'DC-IOCL-8812',
        vehicleNumber: 'MH-04-KA-3129',
        receiptDate: '2026-10-12',
        itemDescription: 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
        quantityReceived: 4,
        remarks: '4 sealed drums inspected with IOCL tamper-proof seals intact. Batch number SERVO-26-04.',
      },
    ],
  },

  INVOICES: {
    key: 'INVOICES',
    title: 'Supplier Invoices',
    subtitle: 'Upload supplier billing records for automatic 3-way reconciliation against PO and GRN.',
    endpoint: '/supplier-invoices/bulk-import',
    templateFilename: 'SLT_Supplier_Invoices_Import_Template.xlsx',
    payloadWrapperKey: 'invoices',
    columns: [
      { key: 'invoiceNumber', label: 'Invoice Number', required: true, type: 'string', description: 'Vendor tax invoice number', sample: 'INV-2026-9041' },
      { key: 'poNumber', label: 'PO Reference Number', required: true, type: 'string', description: 'Cross-referenced purchase order', sample: 'PO-2026-00441' },
      { key: 'vendorName', label: 'Vendor Name', type: 'string', description: 'Issuing company name', sample: 'Tata Steel BSL Limited' },
      { key: 'invoiceDate', label: 'Invoice Date', type: 'date', description: 'Format: YYYY-MM-DD', sample: '2026-10-08' },
      { key: 'dueDate', label: 'Payment Due Date', type: 'date', description: 'Format: YYYY-MM-DD', sample: '2026-11-07' },
      { key: 'subtotal', label: 'Subtotal Amount (₹)', required: true, type: 'number', description: 'Net taxable invoiced value in INR', sample: 242500 },
      { key: 'taxAmount', label: 'GST Amount (₹)', type: 'number', description: 'CGST + SGST or IGST amount (18%)', sample: 43650 },
      { key: 'totalAmount', label: 'Total Invoiced Amount (₹)', required: true, type: 'number', description: 'Gross payable invoice total in INR', sample: 286150 },
      { key: 'paymentTerms', label: 'Payment Terms', type: 'string', description: 'Settlement terms agreed', sample: 'Net 30' },
    ],
    sampleData: [
      {
        invoiceNumber: 'INV-2026-9041',
        poNumber: 'PO-2026-00441',
        vendorName: 'Tata Steel BSL Limited',
        invoiceDate: '2026-10-08',
        dueDate: '2026-11-07',
        subtotal: 242500,
        taxAmount: 43650,
        totalAmount: 286150,
        paymentTerms: 'Net 30',
      },
      {
        invoiceNumber: 'INV-2026-9042',
        poNumber: 'PO-2026-00442',
        vendorName: 'Larsen & Toubro Electrical & Automation Ltd',
        invoiceDate: '2026-10-09',
        dueDate: '2026-11-23',
        subtotal: 568000,
        taxAmount: 102240,
        totalAmount: 670240,
        paymentTerms: 'Net 45',
      },
      {
        invoiceNumber: 'INV-2026-9043',
        poNumber: 'PO-2026-00443',
        vendorName: 'Kirloskar Brothers Limited',
        invoiceDate: '2026-10-10',
        dueDate: '2026-11-09',
        subtotal: 265500,
        taxAmount: 47790,
        totalAmount: 313290,
        paymentTerms: 'Net 30',
      },
      {
        invoiceNumber: 'INV-2026-9044',
        poNumber: 'PO-2026-00444',
        vendorName: 'Indian Oil Corporation Ltd (Lubricants Division)',
        invoiceDate: '2026-10-11',
        dueDate: '2026-11-10',
        subtotal: 153600,
        taxAmount: 27648,
        totalAmount: 181248,
        paymentTerms: 'Net 30',
      },
    ],
  },
}

/**
 * Downloads a professionally formatted Excel (.xlsx) file with headers, descriptions, and sample rows for a single module.
 */
export function downloadExcelTemplate(moduleKey: ModuleKey): void {
  const config = MODULE_CONFIGS[moduleKey]
  if (!config) return

  // 1. Build template data rows
  const headers = config.columns.map((col) => (col.required ? `${col.label} *` : col.label))
  const sampleRows = config.sampleData.map((row) =>
    config.columns.map((col) => row[col.key] ?? '')
  )

  const templateSheetData = [headers, ...sampleRows]
  const wsTemplate = XLSX.utils.aoa_to_sheet(templateSheetData)

  // Configure column widths
  const colWidths = config.columns.map((col) => {
    const labelLen = col.label.length + (col.required ? 4 : 0)
    const sampleLen = String(col.sample || '').length
    return { wch: Math.max(labelLen, sampleLen, 18) }
  })
  wsTemplate['!cols'] = colWidths

  // 2. Build instructions sheet
  const instructionHeaders = ['Field Name', 'Mandatory?', 'Data Type', 'Description / Guidance', 'Sample Value']
  const instructionRows = config.columns.map((col) => [
    col.label,
    col.required ? 'YES (Required)' : 'No (Optional)',
    col.type?.toUpperCase() || 'STRING',
    col.description || '',
    col.sample ?? '',
  ])
  const wsInstructions = XLSX.utils.aoa_to_sheet([
    ['SLT PROCUREMENT SUITE (INDIA) - DATA IMPORT GUIDELINES'],
    [`Module: ${config.title}`],
    ['Notice: Do not rename or reorder columns in the "Data Import Template" sheet.'],
    [],
    instructionHeaders,
    ...instructionRows,
  ])
  wsInstructions['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 55 }, { wch: 32 }]

  // 3. Create Workbook and export
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Data Import Template')
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Field Definitions')

  XLSX.writeFile(wb, config.templateFilename)
}

/**
 * Generates and downloads the comprehensive multi-sheet Indian Procurement sample workbook
 * containing 4 records per applicable sheet.
 */
export function downloadMasterExcelSample(): void {
  const wb = XLSX.utils.book_new()

  const sheetOrder: { key: ModuleKey; sheetName: string }[] = [
    { key: 'VENDORS', sheetName: 'Vendors' },
    { key: 'PURCHASE_ORDERS', sheetName: 'Purchase Orders' },
    { key: 'REQUISITIONS', sheetName: 'Purchase Requisitions' },
    { key: 'ITEMS', sheetName: 'Item Master' },
    { key: 'GOODS_RECEIPTS', sheetName: 'Goods Receipts' },
    { key: 'INVOICES', sheetName: 'Supplier Invoices' },
  ]

  sheetOrder.forEach(({ key, sheetName }) => {
    const config = MODULE_CONFIGS[key]
    const headers = config.columns.map((col) => (col.required ? `${col.label} *` : col.label))
    const rows = config.sampleData.map((row) =>
      config.columns.map((col) => row[col.key] ?? '')
    )
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = config.columns.map((col) => ({
      wch: Math.max(col.label.length + 4, String(col.sample || '').length, 18),
    }))
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  // Instructions / README sheet
  const readmeData = [
    ['SLT PROCUREMENT SUITE — SAMPLE INDIAN PROCUREMENT WORKBOOK'],
    ['Version: 1.0 (Indian Industrial Procurement Edition)'],
    ['Date: October 2026'],
    [],
    ['Sheet Name', 'Module Target', 'Sample Records', 'Primary Indian Entities Included'],
    ['Vendors', 'Vendors & Suppliers', '4 Records', 'Tata Steel BSL, L&T Electrical, Kirloskar Brothers, Indian Oil Corporation'],
    ['Purchase Orders', 'Purchase Orders', '4 Records', 'Structural Steel, 45kW VFD Drives, DB 65/26 Pumps, Servo System 68 Barrels'],
    ['Purchase Requisitions', 'Purchase Requisitions', '4 Records', 'Pune Plant 102, Bengaluru Tech Hub, Chennai Hub, Central QA Lab'],
    ['Item Master', 'Item Master Catalog', '4 Records', 'IS 2062 E250 Beams, L&T Sx2000 VFD, KBL Centrifugal Pump, Servo 68 Oil'],
    ['Goods Receipts', 'Goods Receipt Notes (GRN)', '4 Records', 'Vehicle Nos: MH-12-RN-8821, GJ-06-TT-5021, MH-14-AZ-6619, MH-04-KA-3129'],
    ['Supplier Invoices', 'Supplier Invoices & 3-Way Match', '4 Records', 'Tax Invoices with 18% GST (CGST/SGST/IGST) and 3-Way Matched References'],
    [],
    ['How to use this workbook:'],
    ['1. You can upload this entire workbook directly to ANY module import screen.'],
    ['2. The application will automatically detect and import the corresponding sheet for that module.'],
    ['3. You can also edit these rows or add new rows and upload for batch onboarding.'],
  ]
  const wsReadme = XLSX.utils.aoa_to_sheet(readmeData)
  wsReadme['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 18 }, { wch: 75 }]
  XLSX.utils.book_append_sheet(wb, wsReadme, 'Workbook Guide')

  XLSX.writeFile(wb, 'SLT_Indian_Procurement_Sample_Data.xlsx')
}

export interface ParsedRowResult {
  rowNumber: number
  data: Record<string, any>
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ValidationSummary {
  totalRows: number
  validRows: number
  invalidRows: number
  hasErrors: boolean
  parsedRows: ParsedRowResult[]
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into raw JSON objects.
 * Intelligently detects the correct worksheet if a multi-sheet workbook is uploaded.
 */
export async function parseExcelFile(file: File, moduleHint?: ModuleKey): Promise<Record<string, any>[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  let targetSheetName = workbook.SheetNames[0]

  // If module hint provided, try to find matching sheet in multi-sheet workbook
  if (moduleHint && workbook.SheetNames.length > 1) {
    const hintKeywords: Record<ModuleKey, string[]> = {
      VENDORS: ['vendor', 'supplier'],
      PURCHASE_ORDERS: ['purchase order', 'order', 'po'],
      REQUISITIONS: ['requisition', 'pr'],
      ITEMS: ['item', 'material', 'product', 'catalog'],
      GOODS_RECEIPTS: ['goods receipt', 'grn', 'dock'],
      INVOICES: ['invoice', 'bill'],
    }

    const keywords = hintKeywords[moduleHint] || []
    const matchingSheet = workbook.SheetNames.find((name) => {
      const lower = name.toLowerCase()
      // Skip readme or instruction sheets
      if (lower.includes('guide') || lower.includes('readme') || lower.includes('definition')) return false
      return keywords.some((kw) => lower.includes(kw))
    })

    if (matchingSheet) {
      targetSheetName = matchingSheet
    } else {
      // Check for 'data import template' sheet if user downloaded standard template
      const templateSheet = workbook.SheetNames.find((name) =>
        name.toLowerCase().includes('data import template')
      )
      if (templateSheet) targetSheetName = templateSheet
    }
  } else if (workbook.SheetNames.length > 1) {
    // If first sheet is a guide/definition, pick second sheet
    const firstLower = targetSheetName.toLowerCase()
    if (firstLower.includes('guide') || firstLower.includes('definition') || firstLower.includes('instruction')) {
      targetSheetName = workbook.SheetNames[1] || targetSheetName
    }
  }

  const worksheet = workbook.Sheets[targetSheetName]
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false })
  return rawData
}

/**
 * Validates parsed rows against module configuration rules.
 */
export function validateImportedData(
  moduleKey: ModuleKey,
  rawRows: Record<string, any>[]
): ValidationSummary {
  const config = MODULE_CONFIGS[moduleKey]
  const parsedRows: ParsedRowResult[] = []

  // Create lookup mapping: normalized header -> column key
  const columnLookup = new Map<string, ColumnDefinition>()
  config.columns.forEach((col) => {
    columnLookup.set(col.key.toLowerCase(), col)
    columnLookup.set(col.label.toLowerCase(), col)
    columnLookup.set(`${col.label.toLowerCase()} *`, col)
    columnLookup.set(col.label.toLowerCase().replace(/[^a-z0-9]/g, ''), col)
  })

  // Set for detecting file-level duplicates
  const seenCodes = new Set<string>()

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 2 // 1-indexed header is row 1
    const normalizedData: Record<string, any> = {}
    const errors: string[] = []
    const warnings: string[] = []

    // Map fields from raw row
    Object.entries(rawRow).forEach(([rawHeader, val]) => {
      const cleanHeader = rawHeader.trim().toLowerCase()
      const strippedHeader = cleanHeader.replace(/[^a-z0-9]/g, '')
      const matchedCol = columnLookup.get(cleanHeader) || columnLookup.get(strippedHeader)

      if (matchedCol) {
        normalizedData[matchedCol.key] = typeof val === 'string' ? val.trim() : val
      }
    })

    // Validate each column in config
    config.columns.forEach((col) => {
      const val = normalizedData[col.key]

      // 1. Mandatory check
      if (col.required && (val === undefined || val === null || val === '')) {
        errors.push(`Missing mandatory field: "${col.label}"`)
      }

      // 2. Type validation if value is present
      if (val !== undefined && val !== null && val !== '') {
        if (col.type === 'number') {
          const num = Number(val)
          if (isNaN(num)) {
            errors.push(`Field "${col.label}" must be a valid number (received "${val}")`)
          } else if (num < 0) {
            errors.push(`Field "${col.label}" cannot be negative`)
          }
        } else if (col.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(String(val))) {
            errors.push(`Invalid email format in "${col.label}": "${val}"`)
          }
        }
      }
    })

    // Check duplicate primary keys within the file
    const primaryKeyVal =
      normalizedData.vendorCode ||
      normalizedData.poNumber ||
      normalizedData.prNumber ||
      normalizedData.itemCode ||
      normalizedData.invoiceNumber ||
      normalizedData.grnNumber

    if (primaryKeyVal) {
      const lowerKey = String(primaryKeyVal).toLowerCase()
      if (seenCodes.has(lowerKey)) {
        warnings.push(`Duplicate identifier "${primaryKeyVal}" found in file. Newer row will update previous record.`)
      } else {
        seenCodes.add(lowerKey)
      }
    }

    const isValid = errors.length === 0

    parsedRows.push({
      rowNumber,
      data: normalizedData,
      isValid,
      errors,
      warnings,
    })
  })

  const validRows = parsedRows.filter((r) => r.isValid).length
  const invalidRows = parsedRows.length - validRows

  return {
    totalRows: parsedRows.length,
    validRows,
    invalidRows,
    hasErrors: invalidRows > 0,
    parsedRows,
  }
}

import{r as x,w as m,j as e,B as f,z as h}from"./index-D9TqrYCw.js";import{D as v,a as u}from"./dialog-WdJlzcfm.js";function b({open:a,onOpenChange:o,data:s}){const t=x.useRef(null),{branding:l}=m(),r=()=>{const n=t.current;if(!n)return;const i=window.open("","_blank","width=800,height=600");if(!i)return;const p=String(s.invoiceId).replace(/[^a-zA-Z0-9_-]/g,"").slice(0,64);i.document.write(`
      <html><head><title>Invoice - ${p}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a1a; }
        .invoice { max-width: 600px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
        .brand { font-size: 22px; font-weight: 700; color: #111; }
        .invoice-label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .invoice-id { font-size: 15px; font-weight: 600; margin-top: 2px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
        .field-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .field-value { font-size: 14px; font-weight: 500; }
        .total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 2px solid #111; border-bottom: 2px solid #111; margin-top: 16px; }
        .total-label { font-size: 16px; font-weight: 600; }
        .total-amount { font-size: 22px; font-weight: 700; }
        .status { display: inline-block; padding: 3px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef9c3; color: #854d0e; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
      </style></head><body>
      ${n.innerHTML}
      <script>window.print(); window.close();<\/script>
      </body></html>
    `),i.document.close()},d=s.status==="completed"?"status-approved":s.status==="rejected"?"status-rejected":"status-pending",c=s.status==="completed"?"Approved":s.status.charAt(0).toUpperCase()+s.status.slice(1);return e.jsx(v,{open:a,onOpenChange:o,children:e.jsxs(u,{className:"max-w-lg",children:[e.jsx("div",{ref:t,children:e.jsxs("div",{className:"invoice",children:[e.jsxs("div",{className:"header",children:[e.jsxs("div",{children:[e.jsx("div",{className:"brand",children:l.platform_name||"TestLoom"}),e.jsx("div",{className:"invoice-label",style:{marginTop:4},children:"Invoice"})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsx("div",{className:"invoice-label",children:"Invoice No."}),e.jsx("div",{className:"invoice-id",children:s.invoiceId.slice(0,8).toUpperCase()})]})]}),e.jsxs("div",{className:"grid",children:[e.jsxs("div",{children:[e.jsx("div",{className:"field-label",children:"Student"}),e.jsx("div",{className:"field-value",children:s.studentName})]}),e.jsxs("div",{children:[e.jsx("div",{className:"field-label",children:"Plan"}),e.jsx("div",{className:"field-value",children:s.planName})]}),e.jsxs("div",{children:[e.jsx("div",{className:"field-label",children:"Date"}),e.jsx("div",{className:"field-value",children:new Date(s.date).toLocaleDateString()})]}),e.jsxs("div",{children:[e.jsx("div",{className:"field-label",children:"Status"}),e.jsx("div",{children:e.jsx("span",{className:`status ${d}`,children:c})})]}),e.jsxs("div",{children:[e.jsx("div",{className:"field-label",children:"Payment Method"}),e.jsx("div",{className:"field-value",children:s.paymentMethod||"N/A"})]}),e.jsxs("div",{children:[e.jsx("div",{className:"field-label",children:"Transaction ID"}),e.jsx("div",{className:"field-value",style:{fontFamily:"monospace"},children:s.transactionId||"—"})]}),s.reviewedAt&&e.jsxs("div",{children:[e.jsx("div",{className:"field-label",children:"Approved On"}),e.jsx("div",{className:"field-value",children:new Date(s.reviewedAt).toLocaleDateString()})]})]}),e.jsxs("div",{className:"total-row",children:[e.jsx("div",{className:"total-label",children:"Total Amount"}),e.jsxs("div",{className:"total-amount",children:["৳",(s.amount/100).toLocaleString()]})]}),e.jsx("div",{className:"footer",children:e.jsxs("p",{children:["Thank you for your purchase · ",l.platform_name||"TestLoom"]})})]})}),e.jsx("div",{className:"flex justify-end mt-4",children:e.jsxs(f,{onClick:r,children:[e.jsx(h,{className:"h-4 w-4 mr-2"}),"Print Invoice"]})})]})})}export{b as I};

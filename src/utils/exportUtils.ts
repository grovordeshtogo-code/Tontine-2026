import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Generic types for export data
// Headers: array of strings ["Date", "Montant", ...]
// Body: array of arrays of strings/numbers [["2024-01-01", 5000], ...]

export const exportToPDF = (headers: string[], body: (string | number)[][], title: string) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    autoTable(doc, {
        head: [headers],
        body: body,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [63, 81, 181] }, // Indigo/Primary color
        styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
};

export const exportToJPEG = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Better quality
            backgroundColor: '#ffffff',
            ignoreElements: (node) => {
                return node.classList.contains('no-export'); // exclude buttons
            }
        });

        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, `${fileName}.jpeg`);
            }
        }, 'image/jpeg', 0.95);
    } catch (error) {
        console.error("Error exporting to JPEG:", error);
    }
};

export const exportToWord = async (headers: string[], body: (string | number)[][], title: string) => {
    const tableHeader = new TableRow({
        children: headers.map(header =>
            new TableCell({ children: [new Paragraph({ text: header, style: "strong" })] })
        ),
    });

    const tableRows = body.map(row =>
        new TableRow({
            children: row.map(cell =>
                new TableCell({ children: [new Paragraph(String(cell))] })
            ),
        })
    );

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: title,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
                    spacing: { after: 400 }
                }),
                new Table({
                    rows: [tableHeader, ...tableRows],
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                }),
            ],
        }],
    });

    try {
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${title.replace(/\s+/g, '_').toLowerCase()}.docx`);
    } catch (error) {
        console.error("Error exporting to Word:", error);
    }
};

export const exportToExcel = (headers: string[], body: (string | number)[][], title: string) => {
    // Combine headers and body for SheetJS
    const worksheetData = [headers, ...body];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

    // Adjust column widths (rough estimate based on header length)
    const wscols = headers.map(h => ({ wch: Math.max(h.length + 5, 15) }));
    worksheet['!cols'] = wscols;

    // Generate Excel file
    XLSX.writeFile(workbook, `${title}.xlsx`);
};

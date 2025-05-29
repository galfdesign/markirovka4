import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import AppleCard from './components/AppleCard';
import Header from './components/Header';
import CollectorCard from './components/CollectorCard';
import NorSection from './components/NorSection';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import WaterSupplySection from './components/WaterSupplySection';
import WaterCollectorCard from './components/WaterCollectorCard';
import WaterAppleCard from './components/WaterAppleCard';
import RadiatorAppleCard from './components/RadiatorAppleCard';
import RadiatorCollectorCard from './components/RadiatorCollectorCard';
import RadiatorNorSection from './components/RadiatorNorSection';
import RadiatorDetailsModal from './components/RadiatorDetailsModal';
import RadiatorCardModal from './components/RadiatorCardModal';
import WaterCardModal from './components/WaterCardModal';
// @ts-ignore
const pdfMake = window.pdfMake;
// @ts-ignore
const html2pdf = window.html2pdf;

declare global {
  interface Window {
    html2pdf: any;
  }
}

interface CardData {
  room: string;
  collector: string;
  index: number;
  deltaT?: number;
  totalLength?: number;
  supplyLength?: number;
  innerDiameter?: number;
  pipeStep?: number;
  power?: number;
  flowRate?: number;
  resistance?: number;
  regime?: string;
  usefulLength?: number;
  device?: string;
  type?: string;
  photo?: string;
  placement?: string;
}

const ROOM_OPTIONS_FLOOR = [
  'Гостиная',
  'Спальня',
  'Кухня',
  'Котельная',
  'Холл',
  'Коридор',
  'Кабинет',
  'Санузел'
];
const ROOM_OPTIONS_WATER = [
  'с/у 1 этаж',
  'с/у 2 этаж',
  'кухня',
  'котельная'
];
const ROOM_OPTIONS_RADIATOR = [
  'Гостиная',
  'Спальня',
  'Кухня',
  'Котельная',
  'Холл',
  'Коридор',
  'Кабинет',
  'Санузел'
];

function App() {
  const [activeSection, setActiveSection] = useState('floor');
  // Состояния для напольного отопления
  const [floorCards, setFloorCards] = useState<CardData[]>([]);
  const [floorCollectorName, setFloorCollectorName] = useState('');
  const [floorPhoto, setFloorPhoto] = useState<string | null>(process.env.PUBLIC_URL + '/koltp.png');
  const [floorShowModal, setFloorShowModal] = useState(false);
  const [floorModalData, setFloorModalData] = useState<CardData>({ room: '', collector: '', index: 0 });
  const [floorShowDeleteConfirm, setFloorShowDeleteConfirm] = useState(false);
  const [floorDeleteIndex, setFloorDeleteIndex] = useState<number | null>(null);

  // Состояния для водоснабжения
  const [waterCards, setWaterCards] = useState<CardData[]>([]);
  const [waterCollectorName, setWaterCollectorName] = useState('');
  const [waterPhoto, setWaterPhoto] = useState<string | null>(process.env.PUBLIC_URL + '/koltp.png');
  const [waterShowModal, setWaterShowModal] = useState(false);
  const [waterModalData, setWaterModalData] = useState<CardData>({ room: '', collector: '', index: 0 });
  const [waterShowDeleteConfirm, setWaterShowDeleteConfirm] = useState(false);
  const [waterDeleteIndex, setWaterDeleteIndex] = useState<number | null>(null);

  const [showObjectNameModal, setShowObjectNameModal] = useState(false);
  const [objectName, setObjectName] = useState('');
  const floorListRef = useRef<HTMLDivElement>(null);
  const floorNorSectionRef = useRef<HTMLDivElement>(null);
  const waterListRef = useRef<HTMLDivElement>(null);
  const waterNorSectionRef = useRef<HTMLDivElement>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const floorPhotoInputRef = useRef<HTMLInputElement>(null);
  const waterPhotoInputRef = useRef<HTMLInputElement>(null);

  // Состояния для радиаторов
  const [radiatorCards, setRadiatorCards] = useState<CardData[]>([]);
  const [radiatorCollectorName, setRadiatorCollectorName] = useState('');
  const [radiatorPhoto, setRadiatorPhoto] = useState<string | null>(process.env.PUBLIC_URL + '/koltp.png');
  const [radiatorShowModal, setRadiatorShowModal] = useState(false);
  const [radiatorModalData, setRadiatorModalData] = useState<CardData>({ room: '', collector: '', index: 0 });
  const [radiatorShowDeleteConfirm, setRadiatorShowDeleteConfirm] = useState(false);
  const [radiatorDeleteIndex, setRadiatorDeleteIndex] = useState<number | null>(null);
  const radiatorListRef = useRef<HTMLDivElement>(null);
  const radiatorNorSectionRef = useRef<HTMLDivElement>(null);
  const radiatorPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const dataToSave = {
      ...floorModalData,
      flowRate: floorModalData.flowRate !== undefined && floorModalData.flowRate !== null && !isNaN(Number(floorModalData.flowRate))
        ? Number(floorModalData.flowRate)
        : (floorModalData.collector !== undefined && floorModalData.collector !== '' && !isNaN(Number(floorModalData.collector))
            ? Number(floorModalData.collector)
            : undefined)
    };
    if (floorModalData.index === floorCards.length) {
      setFloorCards([...floorCards, dataToSave]);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } else {
      const newCards = [...floorCards];
      newCards[floorModalData.index] = dataToSave;
      setFloorCards(newCards);
    }
    setFloorShowModal(false);
  };

  const handleDelete = (index: number) => {
    setFloorDeleteIndex(index);
    setFloorShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (floorDeleteIndex !== null) {
      setFloorCards(floorCards.filter((_, i) => i !== floorDeleteIndex));
    }
    setFloorShowDeleteConfirm(false);
    setFloorDeleteIndex(null);
  };

  const cancelDelete = () => {
    setFloorShowDeleteConfirm(false);
    setFloorDeleteIndex(null);
  };

  const handleEdit = (index: number) => {
    setFloorModalData({ ...floorCards[index], index });
    setFloorShowModal(true);
  };

  const handleUpdate = (index: number, data: CardData) => {
    const newCards = [...floorCards];
    newCards[index] = {
      ...newCards[index],
      ...data
    };
    setFloorCards(newCards);
  };

  const handleExportPDF = () => {
    const docDefinition = {
      content: [
        { text: 'Список карточек', style: 'header' },
        {
          ol: floorCards.map((card, idx) => (
            { text: `Помещение: ${card.room || '-'}, Расход: ${card.collector || '-'}` }
          ))
        },
        { text: ' ', margin: [0, 10] },
        { text: 'Карточки', style: 'header', margin: [0, 10, 0, 4] },
        ...floorCards.map((card, idx) => ([
          { text: `Карточка №${idx + 1}`, style: 'subheader', margin: [0, 8, 0, 2] },
          { columns: [
            { width: 'auto', text: 'Помещение:' },
            { width: '*', text: card.room || '-' }
          ]},
          { columns: [
            { width: 'auto', text: 'Расход:' },
            { width: '*', text: card.collector || '-' }
          ]},
        ])).flat()
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 8]
        },
        subheader: {
          fontSize: 13,
          bold: true
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12
      }
    };
    pdfMake.createPdf(docDefinition).download('cards.pdf');
  };

  const handleFloorPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFloorPhoto(ev.target?.result as string);
        if (floorPhotoInputRef.current) floorPhotoInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } else {
      setFloorPhoto(process.env.PUBLIC_URL + '/koltp.png');
      if (floorPhotoInputRef.current) floorPhotoInputRef.current.value = '';
    }
  };

  const handleWaterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setWaterPhoto(ev.target?.result as string);
        if (waterPhotoInputRef.current) waterPhotoInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } else {
      setWaterPhoto(process.env.PUBLIC_URL + '/koltp.png');
      if (waterPhotoInputRef.current) waterPhotoInputRef.current.value = '';
    }
  };

  // Новый обработчик экспорта PDF только по видимой ширине блока с результатами
  const handleExportNorToPdf = async () => {
    setIsLoadingPdf(true);
    const norSection = floorNorSectionRef.current;
    if (!norSection) {
      alert('Скрытый десктопный блок результатов не найден!');
      setIsLoadingPdf(false);
      return;
    }
    // Временно убираем класс скрытия на мобильных
    norSection.classList.remove('hidden-desktop-nor');
    norSection.style.visibility = 'visible';
    norSection.style.zIndex = '9999';
    norSection.style.left = '0';
    norSection.style.top = '0';
    // Ждем загрузки изображений
    const images = norSection.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    const width = norSection.offsetWidth;
    const height = norSection.offsetHeight;
    const canvas = await html2canvas(norSection, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff',
      width,
      height,
      windowWidth: width,
      windowHeight: height
    });
    // Скрываем блок обратно
    norSection.classList.add('hidden-desktop-nor');
    norSection.style.visibility = 'hidden';
    norSection.style.zIndex = '9999';
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const pdfBlob = pdf.output('blob');

    // Формируем имя файла: Напольное_отопление_{collectorName}_{DD.MM.YYYY_HH-mm}.pdf
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const safeCollector = floorCollectorName ? floorCollectorName.replace(/[^a-zA-Zа-яА-Я0-9_\-]/g, '_') : 'Без_названия';
    const fileName = `Напольное_отопление_${safeCollector}_${dateStr}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [pdfFile] }) && navigator.share) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: `Напольное отопление${floorCollectorName ? ' — ' + floorCollectorName : ''}`,
          text: `Напольное отопление${floorCollectorName ? ' — ' + floorCollectorName : ''}`
        });
      } catch (err) {
        // Пользователь отменил отправку — ничего не делаем
      }
    } else {
      alert('Ваш браузер не поддерживает отправку файлов через системное меню. Откройте сайт на мобильном устройстве или обновите браузер.');
      // pdf.save('nor-section.pdf'); // Не сохраняем файл автоматически
    }
    setIsLoadingPdf(false);
  };

  // Новый обработчик экспорта PDF для водоснабжения
  const handleExportWaterNorToPdf = async () => {
    setIsLoadingPdf(true);
    const norSection = waterNorSectionRef.current;
    if (!norSection) {
      alert('Скрытый десктопный блок результатов не найден!');
      setIsLoadingPdf(false);
      return;
    }
    norSection.classList.remove('hidden-desktop-nor');
    norSection.style.visibility = 'visible';
    norSection.style.zIndex = '9999';
    norSection.style.left = '0';
    norSection.style.top = '0';
    const images = norSection.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    const width = norSection.offsetWidth;
    const height = norSection.offsetHeight;
    const canvas = await html2canvas(norSection, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff',
      width,
      height,
      windowWidth: width,
      windowHeight: height
    });
    norSection.classList.add('hidden-desktop-nor');
    norSection.style.visibility = 'hidden';
    norSection.style.zIndex = '9999';
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const pdfBlob = pdf.output('blob');
    // Формируем имя файла: Водоснабжение_{collectorName}_{DD.MM.YYYY_HH-mm}.pdf
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const safeCollector = waterCollectorName ? waterCollectorName.replace(/[^a-zA-Zа-яА-Я0-9_\-]/g, '_') : 'Без_названия';
    const fileName = `Водоснабжение_${safeCollector}_${dateStr}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] }) && navigator.share) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: `Водоснабжение${waterCollectorName ? ' — ' + waterCollectorName : ''}`,
          text: `Водоснабжение${waterCollectorName ? ' — ' + waterCollectorName : ''}`
        });
      } catch (err) {}
    } else {
      alert('Ваш браузер не поддерживает отправку файлов через системное меню. Откройте сайт на мобильном устройстве или обновите браузер.');
    }
    setIsLoadingPdf(false);
  };

  // Преобразование картинки из public в dataURL
  async function getImageAsDataURL(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // PDFmake генератор для раздела НОР
  const generateNorPdf = async () => {
    let photoDataUrl = floorPhoto;
    if (floorPhoto && !floorPhoto.startsWith('data:')) {
      photoDataUrl = await getImageAsDataURL(floorPhoto);
    }
    const tableBody = [
      [
        { text: '№', style: 'tableHeader' },
        { text: 'Помещение', style: 'tableHeader' },
        { text: 'Длина', style: 'tableHeader' },
        { text: 'Расход', style: 'tableHeader' },
        { text: 'Сопротивление', style: 'tableHeader' },
        { text: 'Мощность', style: 'tableHeader' },
        { text: 'Режим', style: 'tableHeader' }
      ],
      ...floorCards.map((l, idx) => [
        idx + 1,
        l.room || '-',
        l.usefulLength !== undefined ? l.usefulLength : '-',
        l.flowRate !== undefined ? l.flowRate.toFixed(2) : '-',
        l.resistance !== undefined ? l.resistance.toFixed(2) : '-',
        l.power !== undefined ? l.power : '-',
        l.regime || '-'
      ])
    ];
    const docDefinition = {
      content: [
        { text: objectName || 'Объект', style: 'header' },
        { text: 'Напольное отопление', style: 'subheader' },
        { text: `Коллектор: ${floorCollectorName || '-'}`, margin: [0, 0, 0, 8] },
        {
          table: {
            headerRows: 1,
            widths: [20, '*', 40, 40, 50, 50, 50],
            body: tableBody
          },
          layout: 'lightHorizontalLines'
        },
        photoDataUrl ? { image: photoDataUrl, width: 200, margin: [0, 16, 0, 0] } : null
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
        subheader: { fontSize: 15, bold: true, margin: [0, 0, 0, 8] },
        tableHeader: { bold: true, fontSize: 13, color: 'black' }
      }
    };
    pdfMake.createPdf(docDefinition).download('nor-section.pdf');
  };

  // Экспорт NorSection через html2pdf.js
  const handleExportWithHtml2pdf = async () => {
    const element = floorNorSectionRef.current;
    if (!window.html2pdf) {
      console.error('html2pdf is not defined! Проверьте подключение CDN в public/index.html');
      alert('Ошибка: html2pdf.js не подключён!');
      return;
    }
    if (!element) {
      console.error('Скрытый NorSection для экспорта PDF не найден (ref = null)');
      alert('Ошибка: скрытый блок для экспорта PDF не найден!');
      return;
    }

    try {
      // Ждем загрузки всех изображений
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // Даем время на рендер графика
      await new Promise(resolve => setTimeout(resolve, 1000));

      const opt = {
        margin: 0,
        filename: 'nor-section.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: 800,
          windowHeight: element.scrollHeight
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      await window.html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Ошибка при экспорте PDF через html2pdf:', err);
      alert('Ошибка при экспорте PDF: ' + err);
    }
  };

  // Добавляю обработчики для водоснабжения:
  const handleWaterUpdate = (index: number, data: CardData) => {
    const newCards = [...waterCards];
    newCards[index] = {
      ...newCards[index],
      ...data
    };
    setWaterCards(newCards);
  };
  const handleWaterEdit = (index: number) => {
    setWaterModalData({ ...waterCards[index], index });
    setWaterShowModal(true);
  };
  const handleWaterDelete = (index: number) => {
    setWaterDeleteIndex(index);
    setWaterShowDeleteConfirm(true);
  };

  const handleExportRadiatorNorToPdf = async () => {
    setIsLoadingPdf(true);
    const norSection = radiatorNorSectionRef.current;
    if (!norSection) {
      alert('Скрытый десктопный блок результатов не найден!');
      setIsLoadingPdf(false);
      return;
    }
    norSection.classList.remove('hidden-desktop-nor');
    norSection.style.visibility = 'visible';
    norSection.style.zIndex = '9999';
    norSection.style.left = '0';
    norSection.style.top = '0';
    const images = norSection.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    const width = norSection.offsetWidth;
    const height = norSection.offsetHeight;
    const canvas = await html2canvas(norSection, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff',
      width,
      height,
      windowWidth: width,
      windowHeight: height
    });
    norSection.classList.add('hidden-desktop-nor');
    norSection.style.visibility = 'hidden';
    norSection.style.zIndex = '9999';
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const pdfBlob = pdf.output('blob');
    // Формируем имя файла: Водоснабжение_{collectorName}_{DD.MM.YYYY_HH-mm}.pdf
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const safeCollector = radiatorCollectorName ? radiatorCollectorName.replace(/[^a-zA-Zа-яА-Я0-9_\-]/g, '_') : 'Без_названия';
    const fileName = `Радиаторы_${safeCollector}_${dateStr}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] }) && navigator.share) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: `Радиаторы${radiatorCollectorName ? ' — ' + radiatorCollectorName : ''}`,
          text: `Радиаторы${radiatorCollectorName ? ' — ' + radiatorCollectorName : ''}`
        });
      } catch (err) {}
    } else {
      alert('Ваш браузер не поддерживает отправку файлов через системное меню. Откройте сайт на мобильном устройстве или обновите браузер.');
    }
    setIsLoadingPdf(false);
  };

  const handleRadiatorSave = (data: any) => {
    const dataToSave = {
      ...data,
      flowRate: data.flowRate !== undefined && data.flowRate !== null && !isNaN(Number(data.flowRate))
        ? Number(data.flowRate)
        : (data.collector !== undefined && data.collector !== '' && !isNaN(Number(data.collector))
            ? Number(data.collector)
            : undefined)
    };
    if (radiatorModalData.index === radiatorCards.length) {
      setRadiatorCards([...radiatorCards, { ...dataToSave, index: radiatorCards.length }]);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } else {
      const newCards = [...radiatorCards];
      newCards[radiatorModalData.index] = { ...dataToSave, index: radiatorModalData.index };
      setRadiatorCards(newCards);
    }
    setRadiatorShowModal(false);
  };

  const handleWaterSave = (data: any) => {
    const dataToSave = {
      ...data,
      flowRate: data.flowRate !== undefined && data.flowRate !== null && !isNaN(Number(data.flowRate))
        ? Number(data.flowRate)
        : (data.collector !== undefined && data.collector !== '' && !isNaN(Number(data.collector))
            ? Number(data.collector)
            : undefined)
    };
    if (waterModalData.index === waterCards.length) {
      setWaterCards([...waterCards, { ...dataToSave, index: waterCards.length }]);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } else {
      const newCards = [...waterCards];
      newCards[waterModalData.index] = { ...dataToSave, index: waterModalData.index };
      setWaterCards(newCards);
    }
    setWaterShowModal(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'floor':
        return (
          <>
            <div className="apple-card-wrapper">
              <div style={{marginBottom: 16}}>
                <button className="apple-create-btn--centered" style={{background:'#eee', color:'#222', width: '100%', border: '2px solid #0071e3', boxShadow: '0 0 0 1px #0071e3'}} onClick={() => document.getElementById('photo-input')?.click()}>
                  Добавить фото
                </button>
                <input id="photo-input" type="file" accept="image/*" style={{display:'none'}} onChange={handleFloorPhotoChange} ref={floorPhotoInputRef} />
                {floorPhoto && (
                  <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
                    <div style={{position:'relative', display:'inline-block'}}>
                      <img src={floorPhoto} alt="Загруженное фото" style={{maxWidth: '100%', maxHeight: 220, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
                      <button onClick={() => { setFloorPhoto(process.env.PUBLIC_URL + '/koltp.png'); if (floorPhotoInputRef.current) floorPhotoInputRef.current.value = ''; }} style={{position:'absolute',top:6,right:6,background:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.10)',cursor:'pointer'}} title="Удалить фото">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <CollectorCard collectorName={floorCollectorName} setCollectorName={setFloorCollectorName} loops={floorCards} />
              {floorCards.map((card, index) => (
                <div key={index}>
                  <AppleCard
                    number={index + 1}
                    onDelete={() => handleDelete(index)}
                    onEdit={() => handleEdit(index)}
                    onUpdate={(data) => handleUpdate(index, data)}
                    room={card.room}
                    collector={card.collector}
                    deltaT={card.deltaT}
                    totalLength={card.totalLength}
                    supplyLength={card.supplyLength}
                    innerDiameter={card.innerDiameter}
                    pipeStep={card.pipeStep}
                    power={card.power}
                    flowRate={card.flowRate}
                    resistance={card.resistance}
                    regime={card.regime}
                    usefulLength={card.usefulLength}
                  />
                </div>
              ))}
              <button className="apple-create-btn--centered" style={{background:'rgb(164,177,194)', color:'#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} onClick={() => {
                setFloorModalData({ room: '', collector: '', index: floorCards.length });
                setFloorShowModal(true);
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                ДОБАВИТЬ ПЕТЛЮ
              </button>
              <button className="apple-create-btn--centered" style={{margin: '24px auto 0 auto', maxWidth: 320, background:'#0071e3', color:'#fff', display: 'block'}} onClick={handleExportNorToPdf}>
                PDF
              </button>
            </div>
            <details style={{ marginTop: 24, width: '100%', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
              <summary style={{ fontSize: 18, fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>Результаты напольного отопления</summary>
              <div ref={floorListRef} className="nor-results-block" style={{ marginTop: 16 }}>
                <NorSection collectorName={floorCollectorName} loops={floorCards} photo={floorPhoto} />
              </div>
            </details>
          </>
        );
      case 'water':
        return (
          <>
            <div className="apple-card-wrapper">
              <div style={{marginBottom: 16}}>
                <button className="apple-create-btn--centered" style={{background:'#eee', color:'#222', width: '100%', border: '2px solid #0071e3', boxShadow: '0 0 0 1px #0071e3'}} onClick={() => document.getElementById('photo-input-water')?.click()}>
                  Добавить фото
                </button>
                <input id="photo-input-water" type="file" accept="image/*" style={{display:'none'}} onChange={handleWaterPhotoChange} ref={waterPhotoInputRef} />
                {waterPhoto && (
                  <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
                    <div style={{position:'relative', display:'inline-block'}}>
                      <img src={waterPhoto} alt="Загруженное фото" style={{maxWidth: '100%', maxHeight: 220, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
                      <button onClick={() => { setWaterPhoto(process.env.PUBLIC_URL + '/koltp.png'); if (waterPhotoInputRef.current) waterPhotoInputRef.current.value = ''; }} style={{position:'absolute',top:6,right:6,background:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.10)',cursor:'pointer'}} title="Удалить фото">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <WaterCollectorCard collectorName={waterCollectorName} setCollectorName={setWaterCollectorName} loops={waterCards} />
              {waterCards.map((card, index) => {
                // Считаем номер для каждого выхода по типу
                const type = card.type;
                const cardsOfType = waterCards.filter(c => c.type === type);
                const calculatedNumber = cardsOfType.findIndex(c => c === card) + 1;
                return (
                  <div key={index}>
                    <WaterAppleCard
                      number={calculatedNumber}
                      onDelete={() => handleWaterDelete(index)}
                      onEdit={() => handleWaterEdit(index)}
                      onUpdate={(data) => handleWaterUpdate(index, data)}
                      room={card.room}
                      collector={card.collector}
                      deltaT={card.deltaT}
                      totalLength={card.totalLength}
                      supplyLength={card.supplyLength}
                      innerDiameter={card.innerDiameter}
                      pipeStep={card.pipeStep}
                      power={card.power}
                      flowRate={card.flowRate}
                      resistance={card.resistance}
                      regime={card.regime}
                      usefulLength={card.usefulLength}
                      type={card.type}
                      device={card.device}
                      photo={card.photo}
                    />
                  </div>
                );
              })}
              <button className="apple-create-btn--centered" style={{background:'rgb(164,177,194)', color:'#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} onClick={() => {
                const last = waterCards[waterCards.length - 1];
                setWaterModalData({
                  room: last?.room || '',
                  collector: '',
                  index: waterCards.length,
                  device: last?.device || '',
                  type: last?.type || ''
                });
                setWaterShowModal(true);
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                ДОБАВИТЬ ВЫХОД
              </button>
              <button className="apple-create-btn--centered" style={{margin: '24px auto 0 auto', maxWidth: 320, background:'#0071e3', color:'#fff', display: 'block'}} onClick={handleExportWaterNorToPdf}>
                PDF
              </button>
            </div>
            <details style={{ marginTop: 24, width: '100%', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
              <summary style={{ fontSize: 18, fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>Результаты водоснабжения</summary>
              <div ref={waterListRef} className="nor-results-block" style={{ marginTop: 16 }}>
                <WaterSupplySection collectorName={waterCollectorName} loops={waterCards} photo={waterPhoto} />
              </div>
            </details>
            <WaterCardModal
              open={waterShowModal}
              onClose={() => setWaterShowModal(false)}
              onSave={handleWaterSave}
              data={waterModalData}
              setData={setWaterModalData}
              number={waterModalData.index + 1}
              roomOptions={ROOM_OPTIONS_WATER}
            />
          </>
        );
      case 'radiator':
        return (
          <>
            <div className="apple-card-wrapper">
              <div style={{marginBottom: 16}}>
                <button className="apple-create-btn--centered" style={{background:'#eee', color:'#222', width: '100%', border: '2px solid #0071e3', boxShadow: '0 0 0 1px #0071e3'}} onClick={() => document.getElementById('photo-input-radiator')?.click()}>
                  Добавить фото
                </button>
                <input id="photo-input-radiator" type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setRadiatorPhoto(ev.target?.result as string);
                      if (radiatorPhotoInputRef.current) radiatorPhotoInputRef.current.value = '';
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setRadiatorPhoto(process.env.PUBLIC_URL + '/koltp.png');
                    if (radiatorPhotoInputRef.current) radiatorPhotoInputRef.current.value = '';
                  }
                }} ref={radiatorPhotoInputRef} />
                {radiatorPhoto && (
                  <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
                    <div style={{position:'relative', display:'inline-block'}}>
                      <img src={radiatorPhoto} alt="Загруженное фото" style={{maxWidth: '100%', maxHeight: 220, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
                      <button onClick={() => { setRadiatorPhoto(process.env.PUBLIC_URL + '/koltp.png'); if (radiatorPhotoInputRef.current) radiatorPhotoInputRef.current.value = ''; }} style={{position:'absolute',top:6,right:6,background:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.10)',cursor:'pointer'}} title="Удалить фото">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <RadiatorCollectorCard collectorName={radiatorCollectorName} setCollectorName={setRadiatorCollectorName} loops={radiatorCards} />
              {radiatorCards.map((card, index) => (
                <div key={index}>
                  <RadiatorAppleCard
                    number={index + 1}
                    onDelete={() => { setRadiatorDeleteIndex(index); setRadiatorShowDeleteConfirm(true); }}
                    onEdit={() => { setRadiatorModalData({ ...radiatorCards[index], index }); setRadiatorShowModal(true); }}
                    onUpdate={data => {
                      const newCards = [...radiatorCards];
                      newCards[index] = { ...newCards[index], ...data };
                      setRadiatorCards(newCards);
                    }}
                    room={card.room}
                    collector={card.collector}
                    placement={card.placement}
                    deltaT={card.deltaT}
                    totalLength={card.totalLength}
                    supplyLength={card.supplyLength}
                    innerDiameter={card.innerDiameter}
                    pipeStep={card.pipeStep}
                    power={card.power}
                    flowRate={card.flowRate}
                    resistance={card.resistance}
                    regime={card.regime}
                    usefulLength={card.usefulLength}
                  />
                </div>
              ))}
              <button className="apple-create-btn--centered" style={{background:'rgb(164,177,194)', color:'#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} onClick={() => {
                setRadiatorModalData({ room: '', collector: '', index: radiatorCards.length });
                setRadiatorShowModal(true);
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                ДОБАВИТЬ РАДИАТОР
              </button>
              <button className="apple-create-btn--centered" style={{margin: '24px auto 0 auto', maxWidth: 320, background:'#0071e3', color:'#fff', display: 'block'}} onClick={handleExportRadiatorNorToPdf}>
                PDF
              </button>
            </div>
            <details style={{ marginTop: 24, width: '100%', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
              <summary style={{ fontSize: 18, fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>Результаты радиаторного отопления</summary>
              <div ref={radiatorListRef} className="nor-results-block" style={{ marginTop: 16 }}>
                <RadiatorNorSection collectorName={radiatorCollectorName} loops={radiatorCards} photo={radiatorPhoto} />
              </div>
            </details>
            <RadiatorCardModal
              open={radiatorShowModal}
              onClose={() => setRadiatorShowModal(false)}
              onSave={handleRadiatorSave}
              data={radiatorModalData}
              setData={setRadiatorModalData}
              number={radiatorModalData.index + 1}
              roomOptions={ROOM_OPTIONS_RADIATOR}
            />
            {radiatorShowDeleteConfirm && (
              <div className="modal-backdrop" style={{zIndex: 3000}}>
                <div className="modal-window" style={{maxWidth: 320, margin: '80px auto', textAlign: 'center'}}>
                  <div style={{fontSize: 18, fontWeight: 600, marginBottom: 18}}>Удалить радиатор?</div>
                  <div style={{fontSize: 15, color: '#666', marginBottom: 24}}>Вы действительно хотите удалить выбранный радиатор? Это действие нельзя отменить.</div>
                  <div style={{display:'flex', gap: 8}}>
                    <button className="apple-create-btn--centered" style={{width:'100%', background:'#ff3b30'}} onClick={() => {
                      if (radiatorDeleteIndex !== null) {
                        setRadiatorCards(radiatorCards.filter((_, i) => i !== radiatorDeleteIndex));
                      }
                      setRadiatorShowDeleteConfirm(false);
                      setRadiatorDeleteIndex(null);
                    }}>Удалить</button>
                    <button className="apple-create-btn--centered" style={{width:'100%', background:'#eee', color:'#222'}} onClick={() => {
                      setRadiatorShowDeleteConfirm(false);
                      setRadiatorDeleteIndex(null);
                    }}>Отмена</button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />
      {/* Скрытый блок для списка карточек */}
      <div ref={floorListRef} style={{ position: 'absolute', left: -9999, top: 0, background: '#fff', color: '#222', padding: 16, fontSize: 12, width: 400 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Список карточек</div>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {floorCards.map((card, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              <span>Помещение: <b>{card.room || '-'}</b>, Коллектор: <b>{card.collector || '-'}</b></span>
            </li>
          ))}
        </ol>
      </div>
      {renderContent()}
      {/* Скрытый десктопный NorSection для PDF-экспорта */}
      <div
        ref={floorNorSectionRef}
        className="hidden-desktop-nor"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1200px',
          minWidth: '1200px',
          maxWidth: '1200px',
          margin: 0,
          padding: 0,
          background: '#fff',
          boxSizing: 'border-box',
          display: 'block',
          overflow: 'visible',
          transform: 'scale(1)',
          transformOrigin: 'top left',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          visibility: 'hidden',
          zIndex: 9999
        }}
      >
        <NorSection 
          collectorName={floorCollectorName} 
          loops={floorCards} 
          photo={floorPhoto}
          containerRef={floorNorSectionRef}
        />
      </div>
      {/* Скрытый десктопный WaterSection для PDF-экспорта */}
      <div
        ref={waterNorSectionRef}
        className="hidden-desktop-nor"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1200px',
          minWidth: '1200px',
          maxWidth: '1200px',
          margin: 0,
          padding: 0,
          background: '#fff',
          boxSizing: 'border-box',
          display: 'block',
          overflow: 'visible',
          transform: 'scale(1)',
          transformOrigin: 'top left',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          visibility: 'hidden',
          zIndex: 9999
        }}
      >
        <WaterSupplySection 
          collectorName={waterCollectorName} 
          loops={waterCards} 
          photo={waterPhoto}
          containerRef={waterNorSectionRef}
        />
      </div>
      {/* Скрытый десктопный RadiatorSection для PDF-экспорта */}
      <div
        ref={radiatorNorSectionRef}
        className="hidden-desktop-nor"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1200px',
          minWidth: '1200px',
          maxWidth: '1200px',
          margin: 0,
          padding: 0,
          background: '#fff',
          boxSizing: 'border-box',
          display: 'block',
          overflow: 'visible',
          transform: 'scale(1)',
          transformOrigin: 'top left',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          visibility: 'hidden',
          zIndex: 9999
        }}
      >
        <RadiatorNorSection 
          collectorName={radiatorCollectorName} 
          loops={radiatorCards} 
          photo={radiatorPhoto}
          containerRef={radiatorNorSectionRef}
        />
      </div>
      {floorShowModal && (
        <div className="modal-backdrop">
          <div className="modal-window modal-small">
            <div className="apple-card-field" style={{marginBottom: 8}}>
              <label style={{textAlign: 'center', width: '100%', fontSize: 16, fontWeight: 600, marginBottom: 6}}>Петля №{floorModalData.index + 1}</label>
              <div className="details-grid" style={{gap: 6}}>
                <div className="details-item" style={{marginBottom: 4}}>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        setFloorModalData({...floorModalData, room: e.target.value});
                      }
                    }}
                    style={{ width: '100%', marginBottom: '4px', textAlign: 'center', fontSize: 14, padding: '6px 8px' }}
                  >
                    <option value="">Выберите помещение</option>
                    {ROOM_OPTIONS_FLOOR.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={floorModalData.room}
                    onChange={e => setFloorModalData({...floorModalData, room: e.target.value})}
                    placeholder="Или введите своё название"
                    style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'block', textAlign: 'center', fontSize: 15, padding: '7px 10px' }}
                  />
                </div>
                <div className="details-item" style={{marginBottom: 4}}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={floorModalData.collector}
                    onChange={e => setFloorModalData({...floorModalData, collector: e.target.value})}
                    placeholder="Расход литр/минуту"
                    style={{fontSize: 15, padding: '7px 10px', marginBottom: 4}}
                  />
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={parseFloat(floorModalData.collector) || 0}
                    onChange={e => setFloorModalData({...floorModalData, collector: e.target.value})}
                    style={{ width: '100%', marginTop: 2 }}
                  />
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,marginTop:8}}>
              <button className="apple-create-btn--centered" style={{width: '100%', background:'#0071e3', fontSize: 15, padding: '10px 0', margin: 0}} onClick={handleSave}>
                Сохранить
              </button>
              <button className="apple-create-btn--centered" style={{width: '100%', background:'#eee', color:'#222', fontSize: 15, padding: '10px 0', margin: 0}} onClick={() => setFloorShowModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {floorShowDeleteConfirm && (
        <div className="modal-backdrop" style={{zIndex: 3000}}>
          <div className="modal-window" style={{maxWidth: 320, margin: '80px auto', textAlign: 'center'}}>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 18}}>Удалить петлю?</div>
            <div style={{fontSize: 15, color: '#666', marginBottom: 24}}>Вы действительно хотите удалить выбранную петлю? Это действие нельзя отменить.</div>
            <div style={{display:'flex', gap: 8}}>
              <button className="apple-create-btn--centered" style={{width:'100%', background:'#ff3b30'}} onClick={confirmDelete}>Удалить</button>
              <button className="apple-create-btn--centered" style={{width:'100%', background:'#eee', color:'#222'}} onClick={cancelDelete}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {showObjectNameModal && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="apple-card-field">
              <label>Название объекта</label>
              <input
                type="text"
                value={objectName}
                onChange={e => setObjectName(e.target.value)}
                placeholder="Введите название объекта"
              />
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button className="apple-create-btn--centered" style={{width: '100%', background:'#0071e3'}}
                onClick={() => {
                  setShowObjectNameModal(false);
                }}>
                Продолжить
              </button>
              <button className="apple-create-btn--centered" style={{width: '100%', background:'#eee', color:'#222'}}
                onClick={() => setShowObjectNameModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoadingPdf && (
        <div style={{position:'fixed',zIndex:99999,top:0,left:0,right:0,bottom:0,background:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:'32px 40px',borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.10)',fontSize:20,fontWeight:600,color:'#0071e3',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <svg width="48" height="48" viewBox="0 0 50 50" style={{marginBottom:16}}><circle cx="25" cy="25" r="20" stroke="#0071e3" strokeWidth="5" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 25 25;360 25 25" keyTimes="0;1"/></circle></svg>
            Формируется PDF...
          </div>
        </div>
      )}
      {waterShowDeleteConfirm && (
        <div className="modal-backdrop" style={{zIndex: 3000}}>
          <div className="modal-window" style={{maxWidth: 320, margin: '80px auto', textAlign: 'center'}}>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 18}}>Удалить выход?</div>
            <div style={{fontSize: 15, color: '#666', marginBottom: 24}}>Вы действительно хотите удалить выбранный выход? Это действие нельзя отменить.</div>
            <div style={{display:'flex', gap: 8}}>
              <button className="apple-create-btn--centered" style={{width:'100%', background:'#ff3b30'}} onClick={() => {
                if (waterDeleteIndex !== null) {
                  setWaterCards(waterCards.filter((_, i) => i !== waterDeleteIndex));
                }
                setWaterShowDeleteConfirm(false);
                setWaterDeleteIndex(null);
              }}>Удалить</button>
              <button className="apple-create-btn--centered" style={{width:'100%', background:'#eee', color:'#222'}} onClick={() => {
                setWaterShowDeleteConfirm(false);
                setWaterDeleteIndex(null);
              }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

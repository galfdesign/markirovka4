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
import ConfirmModal from './components/ConfirmModal';
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
  const [floorDeleteIndex, setFloorDeleteIndex] = useState<number | null>(null);

  // Состояния для водоснабжения
  const [waterCards, setWaterCards] = useState<CardData[]>([]);
  const [waterCollectorName, setWaterCollectorName] = useState('');
  const [waterPhoto, setWaterPhoto] = useState<string | null>(process.env.PUBLIC_URL + '/voda.png');
  const [waterShowModal, setWaterShowModal] = useState(false);
  const [waterModalData, setWaterModalData] = useState<CardData>({ room: '', collector: '', index: 0 });
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
  const [radiatorPhoto, setRadiatorPhoto] = useState<string | null>(process.env.PUBLIC_URL + '/rad.png');
  const [radiatorShowModal, setRadiatorShowModal] = useState(false);
  const [radiatorModalData, setRadiatorModalData] = useState<CardData>({ room: '', collector: '', index: 0 });
  const [radiatorDeleteIndex, setRadiatorDeleteIndex] = useState<number | null>(null);
  const radiatorListRef = useRef<HTMLDivElement>(null);
  const radiatorNorSectionRef = useRef<HTMLDivElement>(null);
  const radiatorPhotoInputRef = useRef<HTMLInputElement>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalAction, setConfirmModalAction] = useState<() => void>(() => () => {});
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');

  const [showExportBlock, setShowExportBlock] = useState(false);
  const [showExportBlockWater, setShowExportBlockWater] = useState(false);
  const [showExportBlockRadiator, setShowExportBlockRadiator] = useState(false);

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
    setConfirmModalTitle('Удалить петлю?');
    setConfirmModalMessage('Вы действительно хотите удалить выбранную петлю? Это действие нельзя отменить.');
    setConfirmModalAction(() => () => {
      setFloorCards(floorCards.filter((_, i) => i !== index));
      setConfirmModalOpen(false);
    });
    setConfirmModalOpen(true);
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

  const handleFloorPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const compressed = await compressImageToMaxSize(ev.target?.result as string);
          setFloorPhoto(compressed);
        } catch {
          setFloorPhoto(ev.target?.result as string);
        }
        if (floorPhotoInputRef.current) floorPhotoInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWaterPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const compressed = await compressImageToMaxSize(ev.target?.result as string);
          setWaterPhoto(compressed);
        } catch {
          setWaterPhoto(ev.target?.result as string);
        }
        if (waterPhotoInputRef.current) waterPhotoInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRadiatorPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const compressed = await compressImageToMaxSize(ev.target?.result as string);
          setRadiatorPhoto(compressed);
        } catch {
          setRadiatorPhoto(ev.target?.result as string);
        }
        if (radiatorPhotoInputRef.current) radiatorPhotoInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  // Новый обработчик экспорта PDF только по видимой ширине блока с результатами
  const handleExportNorToPdf = async () => {
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
    setConfirmModalTitle('Удалить выход?');
    setConfirmModalMessage('Вы действительно хотите удалить выбранный выход? Это действие нельзя отменить.');
    setConfirmModalAction(() => () => {
      setWaterCards(waterCards.filter((_, i) => i !== index));
      setConfirmModalOpen(false);
    });
    setConfirmModalOpen(true);
  };

  const handleExportRadiatorNorToPdf = async () => {
    const docDefinition = {
      content: [
        { text: 'Список карточек', style: 'header' },
        {
          ol: radiatorCards.map((card, idx) => (
            { text: `Помещение: ${card.room || '-'}, Расход: ${card.collector || '-'}` }
          ))
        },
        { text: ' ', margin: [0, 10] },
        { text: 'Карточки', style: 'header', margin: [0, 10, 0, 4] },
        ...radiatorCards.map((card, idx) => ([
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

  const handleRadiatorDelete = (index: number) => {
    setConfirmModalTitle('Удалить радиатор?');
    setConfirmModalMessage('Вы действительно хотите удалить выбранный радиатор? Это действие нельзя отменить.');
    setConfirmModalAction(() => () => {
      const newCards = [...radiatorCards];
      newCards.splice(index, 1);
      setRadiatorCards(newCards);
      setRadiatorShowModal(false);
      setConfirmModalOpen(false);
    });
    setConfirmModalOpen(true);
  };

  // Добавляем функцию ожидания появления canvas
  function waitForCanvas(selector: string, timeout = 5000): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      function check() {
        const canvas = document.querySelector(selector) as HTMLCanvasElement | null;
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          resolve(canvas);
        } else if (Date.now() - start > timeout) {
          reject(new Error('Canvas не появился или имеет нулевые размеры'));
        } else {
          setTimeout(check, 100);
        }
      }
      check();
    });
  }

  // Функция для сжатия фото до 300 КБ
  async function compressImageToMaxSize(imageUrl: string, maxWidth = 800, maxSizeKB = 300): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context is null'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Подбираем качество
        let quality = 0.8;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  const handleServerPdfTest = async () => {
    setIsLoadingPdf(true);
    setShowExportBlock(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const norSectionEl = document.querySelector('.export-nor-section') as HTMLElement | null;
      if (!norSectionEl) {
        alert('Экспортируемый блок не найден!');
        setIsLoadingPdf(false);
        setShowExportBlock(false);
        return;
      }
      let canvas: HTMLCanvasElement;
      try {
        canvas = await waitForCanvas('.export-nor-section canvas');
      } catch (e) {
        alert('График не отрисован. Попробуйте чуть позже или обновите страницу.');
        setIsLoadingPdf(false);
        setShowExportBlock(false);
        return;
      }
      let data = norSectionEl.innerHTML;
      let img = canvas.toDataURL();
      const res = await fetch(`https://oyofgeyosh.beget.app/getPdf`, {
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ html: data, canvas: img, photo: floorPhoto }),
      });
      const body = await res.json();
      console.log('Server response:', body);
      
      // Если есть PDF в бинарном формате, создаем и скачиваем файл
      if (body.pdf) {
        const pdfBlob = new Blob([new Uint8Array(body.pdf)], { type: 'application/pdf' });
        let fileName = 'export.pdf';
        if (activeSection === 'floor') fileName = 'Напольное_отопление.pdf';
        if (activeSection === 'water') fileName = 'Водоснабжение.pdf';
        if (activeSection === 'radiator') fileName = 'Радиаторы.pdf';
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          try {
            await navigator.share({
              files: [file],
              title: 'PDF',
              text: 'Экспортированный PDF'
            });
          } catch (err) {
            // Пользователь отменил отправку — ничего не делаем
          }
        } else {
          alert('Ваш браузер не поддерживает отправку файлов через системное меню. Откройте сайт на мобильном устройстве или обновите браузер.');
        }
      }

      // 5. Скрыть блок обратно
      norSectionEl.classList.add('hidden-desktop-nor');
      norSectionEl.style.visibility = 'hidden';
      norSectionEl.style.zIndex = '9999';
    } catch (error) {
      console.error('Error during server PDF generation:', error);
      alert('Ошибка при генерации PDF на сервере: ' + error);
    } finally {
      setIsLoadingPdf(false);
      setShowExportBlock(false);
    }
  };

  const handleServerPdfTestWater = async () => {
    setIsLoadingPdf(true);
    setShowExportBlockWater(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const norSectionEl = document.querySelector('.export-water-section') as HTMLElement | null;
      if (!norSectionEl) {
        alert('Экспортируемый блок не найден!');
        setIsLoadingPdf(false);
        setShowExportBlockWater(false);
        return;
      }
      let data = norSectionEl.innerHTML;
      // canvas больше не нужен, отправляем пустую строку
      const res = await fetch(`https://oyofgeyosh.beget.app/getPdf`, {
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ html: data, canvas: '', photo: waterPhoto }),
      });
      const body = await res.json();
      console.log('Server response:', body);
      
      // Если есть PDF в бинарном формате, создаем и скачиваем файл
      if (body.pdf) {
        const pdfBlob = new Blob([new Uint8Array(body.pdf)], { type: 'application/pdf' });
        let fileName = 'export.pdf';
        if (activeSection === 'floor') fileName = 'Напольное_отопление.pdf';
        if (activeSection === 'water') fileName = 'Водоснабжение.pdf';
        if (activeSection === 'radiator') fileName = 'Радиаторы.pdf';
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          try {
            await navigator.share({
              files: [file],
              title: 'PDF',
              text: 'Экспортированный PDF'
            });
          } catch (err) {
            // Пользователь отменил отправку — ничего не делаем
          }
        } else {
          alert('Ваш браузер не поддерживает отправку файлов через системное меню. Откройте сайт на мобильном устройстве или обновите браузер.');
        }
      }

      // 5. Скрыть блок обратно
      norSectionEl.classList.add('hidden-desktop-nor');
      norSectionEl.style.visibility = 'hidden';
      norSectionEl.style.zIndex = '9999';
    } catch (error) {
      console.error('Error during server PDF generation:', error);
      alert('Ошибка при генерации PDF на сервере: ' + error);
    } finally {
      setIsLoadingPdf(false);
      setShowExportBlockWater(false);
    }
  };

  const handleServerPdfTestRadiator = async () => {
    setIsLoadingPdf(true);
    setShowExportBlockRadiator(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const norSectionEl = document.querySelector('.export-radiator-section') as HTMLElement | null;
      if (!norSectionEl) {
        alert('Экспортируемый блок не найден!');
        setIsLoadingPdf(false);
        setShowExportBlockRadiator(false);
        return;
      }
      let canvas: HTMLCanvasElement;
      try {
        canvas = await waitForCanvas('.export-radiator-section canvas');
      } catch (e) {
        alert('График не отрисован. Попробуйте чуть позже или обновите страницу.');
        setIsLoadingPdf(false);
        setShowExportBlockRadiator(false);
        return;
      }
      let data = norSectionEl.innerHTML;
      let img = canvas.toDataURL();
      const res = await fetch(`https://oyofgeyosh.beget.app/getPdf`, {
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ html: data, canvas: img, photo: radiatorPhoto }),
      });
      const body = await res.json();
      console.log('Server response:', body);
      
      // Если есть PDF в бинарном формате, создаем и скачиваем файл
      if (body.pdf) {
        const pdfBlob = new Blob([new Uint8Array(body.pdf)], { type: 'application/pdf' });
        let fileName = 'export.pdf';
        if (activeSection === 'floor') fileName = 'Напольное_отопление.pdf';
        if (activeSection === 'water') fileName = 'Водоснабжение.pdf';
        if (activeSection === 'radiator') fileName = 'Радиаторы.pdf';
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          try {
            await navigator.share({
              files: [file],
              title: 'PDF',
              text: 'Экспортированный PDF'
            });
          } catch (err) {
            // Пользователь отменил отправку — ничего не делаем
          }
        } else {
          alert('Ваш браузер не поддерживает отправку файлов через системное меню. Откройте сайт на мобильном устройстве или обновите браузер.');
        }
      }

      // 5. Скрыть блок обратно
      norSectionEl.classList.add('hidden-desktop-nor');
      norSectionEl.style.visibility = 'hidden';
      norSectionEl.style.zIndex = '9999';
    } catch (error) {
      console.error('Error during server PDF generation:', error);
      alert('Ошибка при генерации PDF на сервере: ' + error);
    } finally {
      setIsLoadingPdf(false);
      setShowExportBlockRadiator(false);
    }
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
              <button className="apple-create-btn--centered" style={{margin: '12px auto 0 auto', maxWidth: 320, background:'#4CAF50', color:'#fff', display: 'block'}} onClick={handleServerPdfTest}>
                Экспорт PDF
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
                      <button onClick={() => { setWaterPhoto(process.env.PUBLIC_URL + '/voda.png'); if (waterPhotoInputRef.current) waterPhotoInputRef.current.value = ''; }} style={{position:'absolute',top:6,right:6,background:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.10)',cursor:'pointer'}} title="Удалить фото">
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
              <button className="apple-create-btn--centered" style={{margin: '12px auto 0 auto', maxWidth: 320, background:'#4CAF50', color:'#fff', display: 'block'}} onClick={handleServerPdfTestWater}>
                Экспорт PDF
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
                <input id="photo-input-radiator" type="file" accept="image/*" style={{display:'none'}} onChange={handleRadiatorPhotoChange} ref={radiatorPhotoInputRef} />
                {radiatorPhoto && (
                  <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
                    <div style={{position:'relative', display:'inline-block'}}>
                      <img src={radiatorPhoto} alt="Загруженное фото" style={{maxWidth: '100%', maxHeight: 220, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
                      <button onClick={() => { setRadiatorPhoto(process.env.PUBLIC_URL + '/rad.png'); if (radiatorPhotoInputRef.current) radiatorPhotoInputRef.current.value = ''; }} style={{position:'absolute',top:6,right:6,background:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.10)',cursor:'pointer'}} title="Удалить фото">
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
                    onDelete={() => handleRadiatorDelete(index)}
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
              <button className="apple-create-btn--centered" style={{margin: '12px auto 0 auto', maxWidth: 320, background:'#4CAF50', color:'#fff', display: 'block'}} onClick={handleServerPdfTestRadiator}>
                Экспорт PDF
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
      {/* Скрытые экспортируемые блоки для PDF-экспорта */}
      {showExportBlock && (
        <div className="export-nor-section" style={{
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
          zIndex: 9999,
          visibility: 'hidden',
        }}>
          <NorSection 
            collectorName={floorCollectorName} 
            loops={floorCards} 
            photo={floorPhoto}
            containerRef={null}
            forceReady={true}
          />
        </div>
      )}
      {showExportBlockWater && (
        <div className="export-water-section" style={{
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
          zIndex: 9999,
          visibility: 'hidden',
        }}>
          <WaterSupplySection 
            collectorName={waterCollectorName} 
            loops={waterCards} 
            photo={waterPhoto}
            containerRef={null}
            forceReady={true}
          />
        </div>
      )}
      {showExportBlockRadiator && (
        <div className="export-radiator-section" style={{
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
          zIndex: 9999,
          visibility: 'hidden',
        }}>
          <RadiatorNorSection 
            collectorName={radiatorCollectorName} 
            loops={radiatorCards} 
            photo={radiatorPhoto}
            containerRef={null}
            forceReady={true}
          />
        </div>
      )}
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
      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmModalAction}
        title={confirmModalTitle}
        message={confirmModalMessage}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
}

export default App;

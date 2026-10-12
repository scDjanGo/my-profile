export type Localized = { en: string; ru: string };

export interface Project {
  id: number;
  img: string;
  tag: Localized;
  title: string;
  description: Localized;
  link: string;
}

export const PortfolioData: Project[] = [
  {
    id: 9,
    img: "/img/MyProject/jerdeshmoskva.png",
    tag: { en: "real estate", ru: "недвижимость" },
    title: "JerdeShMoskva.ru",
    description: {
      en: "JerdeShMoskva.ru is a real estate website offering property listings, sales, and rentals in Moscow and surrounding areas.",
      ru: "JerdeShMoskva.ru — сайт недвижимости с объявлениями о продаже и аренде жилья в Москве и Подмосковье.",
    },
    link: "https://jerdeshmoskva.ru/",
  },
  {
    id: 11,
    img: "/img/MyProject/prolab-agency.png",
    tag: { en: "digital innovation / IT agency", ru: "цифровые инновации / IT-агентство" },
    title: "PROlab Agency",
    description: {
      en: "PROlab Agency is a digital innovation company from Kyrgyzstan, specializing in web and mobile development, UI/UX design, AI solutions, SEO, SMM, chatbots, CRM, ERP, and IT consulting.",
      ru: "PROlab Agency — компания цифровых инноваций из Кыргызстана: веб- и мобильная разработка, UI/UX-дизайн, AI-решения, SEO, SMM, чат-боты, CRM, ERP и IT-консалтинг.",
    },
    link: "https://prolabagency.com",
  },
  {
    id: 10,
    img: "/img/MyProject/karagay.png",
    tag: { en: "agriculture", ru: "сельское хозяйство" },
    title: "Karagay.kg",
    description: {
      en: "Karagay.kg is an online platform dedicated to agricultural products and services in Kyrgyzstan.",
      ru: "Karagay.kg — онлайн-платформа сельскохозяйственных товаров и услуг в Кыргызстане.",
    },
    link: "https://www.karagay.kg",
  },
  {
    id: 12,
    img: "/img/MyProject/kukuruza777.png",
    tag: { en: "food", ru: "продукты питания" },
    title: "Kukuruza 777",
    description: {
      en: "Kukuruza 777 is a Kyrgyz brand offering natural corn sticks made from selected corn, sugar, and oil without artificial additives or GMOs.",
      ru: "Kukuruza 777 — кыргызский бренд натуральных кукурузных палочек из отборной кукурузы, сахара и масла без искусственных добавок и ГМО.",
    },
    link: "https://777kukuruza.kg",
  },
  {
    id: 13,
    img: "/img/MyProject/impuls-med.png",
    tag: { en: "medical", ru: "медицина" },
    title: "impuls-med",
    description: {
      en: "Impuls-Med is a modern medical center in Osh, Kyrgyzstan, providing comprehensive diagnostics, treatments, and consultations in orthopedics, cardiology, neurology, and more.",
      ru: "Импульс-Мед — современный медицинский центр в Оше: комплексная диагностика, лечение и консультации по ортопедии, кардиологии, неврологии и другим направлениям.",
    },
    link: "https://impuls-med.kg",
  },
  {
    id: 14,
    img: "/img/MyProject/nerjaveyka.png",
    tag: { en: "construction", ru: "строительство" },
    title: "НЕРЖАВЕЙКА",
    description: {
      en: "Nerzhaveyka is a leading supplier of stainless steel products in Osh, Kyrgyzstan, including pipes, sheets, profiles, and fittings for wholesale and retail.",
      ru: "Нержавейка — ведущий поставщик изделий из нержавеющей стали в Оше: трубы, листы, профили и фурнитура оптом и в розницу.",
    },
    link: "https://nerzhaveyka.kg",
  },
  {
    id: 8,
    img: "/img/MyProject/nedvizhka.png",
    tag: { en: "real estate", ru: "недвижимость" },
    title: "Nedvizhka.kg",
    description: {
      en: "Nedvizhka.kg is an online real estate platform providing listings for buying, selling, and renting properties in Kyrgyzstan.",
      ru: "Nedvizhka.kg — онлайн-платформа недвижимости с объявлениями о покупке, продаже и аренде в Кыргызстане.",
    },
    link: "https://nedvizhka.kg",
  },
  {
    id: 1,
    img: "/img/MyProject/webmenu.png",
    tag: { en: "b2b", ru: "b2b" },
    title: "WebMenu.online",
    description: {
      en: "WebMenu.online is an online platform for creating digital menus for restaurants and cafes.",
      ru: "WebMenu.online — платформа для создания электронных меню для ресторанов и кафе.",
    },
    link: "https://webmenu.online/",
  },
  {
    id: 2,
    img: "/img/MyProject/webmenu.qr.png",
    tag: { en: "b2c", ru: "b2c" },
    title: "WebMenu.QR",
    description: {
      en: "The QR version of WebMenu.online allows customers to instantly access a digital menu by scanning a QR code.",
      ru: "QR-версия WebMenu.online: гости открывают электронное меню, просто отсканировав QR-код.",
    },
    link: "https://ocak-kebab-1.webmenu.online/",
  },
  {
    id: 7,
    img: "/img/MyProject/aigo_ads.png",
    tag: { en: "e-commerce", ru: "e-commerce" },
    title: "AIGO.KG",
    description: {
      en: "AIGO.KG is an online platform offering a wide range of electronics and home appliances in Kyrgyzstan.",
      ru: "AIGO.KG — интернет-магазин с широким выбором электроники и бытовой техники в Кыргызстане.",
    },
    link: "https://aigo.kg",
  },
  {
    id: 3,
    img: "/img/MyProject/dukon.png",
    tag: { en: "b2b", ru: "b2b" },
    title: "Dukon.online",
    description: {
      en: "Dukon.online is an innovative platform designed to streamline the process of creating and managing websites for small businesses.",
      ru: "Dukon.online — платформа, которая упрощает создание и управление сайтами для малого бизнеса.",
    },
    link: "https://dukon.online/",
  },
  {
    id: 4,
    img: "/img/MyProject/dukon.qr.png",
    tag: { en: "b2c", ru: "b2c" },
    title: "Store.dukon",
    description: {
      en: "The QR version of Dukon.online allows users to quickly access a mobile-friendly website version by scanning a QR code.",
      ru: "QR-версия Dukon.online: мобильная версия магазина открывается сканированием QR-кода.",
    },
    link: "https://store.dukon.online/",
  },
  {
    id: 5,
    img: "/img/MyProject/worksapce.png",
    tag: { en: "b2b", ru: "b2b" },
    title: "WorkSpace",
    description: {
      en: "Workspace is a collaborative platform designed to enhance team productivity and communication.",
      ru: "Workspace — платформа для совместной работы, повышающая продуктивность и улучшающая коммуникацию в команде.",
    },
    link: "https://www.godaddy.com/forsale/workspace.online?utm_source=TDFS_BINNS&utm_medium=parkedpages&utm_campaign=x_corp_tdfs-binns_base&traffic_type=TDFS_BINNS&traffic_id=binns&",
  },
  {
    id: 6,
    img: "/img/MyProject/ngt.marketplace.png",
    tag: { en: "b2b", ru: "b2b" },
    title: "NFT Marketplace",
    description: {
      en: "NFT Marketplace is an online platform for buying and selling NFTs (Non-Fungible Tokens).",
      ru: "NFT Marketplace — онлайн-площадка для покупки и продажи NFT (невзаимозаменяемых токенов).",
    },
    link: "https://nft-market-3z8j2gel0-scdjangos-projects.vercel.app/",
  },
];

export const PetProjects: Project[] = [
  {
    id: 1,
    img: "/img/MyProject/dictionary.png",
    tag: { en: "education", ru: "образование" },
    title: "Dictionary Cards",
    description: {
      en: "Dictionary Cards is an online educational tool that helps users learn and memorize vocabulary using interactive flashcards.",
      ru: "Dictionary Cards — обучающий сервис, который помогает учить и запоминать слова с помощью интерактивных карточек.",
    },
    link: "https://dictionary-cards.vercel.app",
  },
  {
    id: 2,
    img: "/img/MyProject/questions-answers.png",
    tag: { en: "education", ru: "образование" },
    title: "Questions & Answers",
    description: {
      en: "Questions & Answers is a platform designed for mentors to assess students' knowledge and administer tests efficiently.",
      ru: "Questions & Answers — платформа, на которой менторы проверяют знания студентов и удобно проводят тесты.",
    },
    link: "https://questions-answers-beige.vercel.app",
  },
  {
    id: 3,
    img: "/img/MyProject/web-redactor.png",
    tag: { en: "learning", ru: "обучение" },
    title: "Web-Redactor",
    description: {
      en: "An intuitive online editor designed specifically for learning and practicing English grammar. Teachers and students can create, edit, and complete interactive exercises with real-time gap-filling, instant feedback, and progress tracking. Perfect for classrooms, self-study, or language mentoring.",
      ru: "Удобный онлайн-редактор для изучения и практики английской грамматики. Учителя и ученики создают, редактируют и выполняют интерактивные упражнения с заполнением пропусков, мгновенной проверкой и отслеживанием прогресса. Подходит для уроков, самостоятельной работы и менторства.",
    },
    link: "https://web-redactor.vercel.app",
  },
];

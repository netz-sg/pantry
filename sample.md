import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Calendar, 
  ShoppingBag, 
  Search, 
  Plus, 
  Clock, 
  Users, 
  ArrowLeft, 
  Minus, 
  Check, 
  ArrowRight,
  Flame,
  BookOpen, 
  X,
  LayoutGrid,
  MoreVertical,
  ChevronRight,
  Utensils,
  Maximize2,
  CheckCircle2,
  Share2,
  Printer,
  Heart,
  Package, // Für Vorrat
  Settings,
  HelpCircle,
  LogOut,
  Hash
} from 'lucide-react';

// --- DATEN (Lokal) ---

const REZEPTE = [
  {
    id: '1',
    titel: 'Thai Basil Chicken',
    untertitel: 'Pad Kra Pao',
    beschreibung: 'Der Streetfood-Klassiker aus Bangkok. Scharf, schnell und unglaublich aromatisch. Das Geheimnis liegt im Holy Basil.',
    bild: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1200',
    zeit: '20 Min',
    portionen: 2,
    kalorien: 450,
    kategorie: 'Asiatisch',
    favorit: true,
    tags: ['Scharf', 'Wok', 'High Protein'],
    zutaten: [
      { name: 'Hähnchenbrust (gehackt)', menge: 400, einheit: 'g' },
      { name: 'Thai Holy Basil', menge: 2, einheit: 'Handvoll' },
      { name: 'Knoblauchzehen', menge: 4, einheit: 'Stk' },
      { name: 'Vogelaugenchili', menge: 3, einheit: 'Stk' },
      { name: 'Sojasauce (Hell)', menge: 1, einheit: 'EL' },
      { name: 'Austernsauce', menge: 2, einheit: 'EL' },
      { name: 'Spiegelei (Crispy)', menge: 2, einheit: 'Stk' },
    ],
    anleitung: [
      'Chili und Knoblauch im Mörser zu einer groben Paste verarbeiten.',
      'Wok extrem heiß werden lassen. Öl hineingeben.',
      'Paste kurz anbraten (Achtung: Dämpfe!), dann Fleisch dazu.',
      'Fleisch scharf anbraten, nicht kochen lassen.',
      'Saucen mischen und über das Fleisch geben. Einkochen lassen.',
      'Hitze aus. Basilikum unterheben, bis es gerade so welk ist.'
    ]
  },
  {
    id: '2',
    titel: 'Midnight Risotto',
    untertitel: 'Mit Waldpilzen & Thymian',
    beschreibung: 'Ein tiefes, erdiges Gericht für späte Abende. Geduld ist die wichtigste Zutat hier.',
    bild: 'https://images.unsplash.com/photo-1626804475297-411dbe6372bf?auto=format&fit=crop&q=80&w=1200',
    zeit: '50 Min',
    portionen: 4,
    kalorien: 620,
    kategorie: 'Italienisch',
    favorit: false,
    tags: ['Vegetarisch', 'Slow Food', 'Dinner'],
    zutaten: [
      { name: 'Arborio Reis', menge: 350, einheit: 'g' },
      { name: 'Getrocknete Steinpilze', menge: 30, einheit: 'g' },
      { name: 'Frische Pilze (Mix)', menge: 400, einheit: 'g' },
      { name: 'Weißwein (Trocken)', menge: 200, einheit: 'ml' },
      { name: 'Gemüsefond', menge: 1.2, einheit: 'L' },
      { name: 'Parmigiano Reggiano', menge: 80, einheit: 'g' },
      { name: 'Kalte Butter', menge: 60, einheit: 'g' },
    ],
    anleitung: [
      'Steinpilze in heißem Wasser einweichen. Sud auffangen!',
      'Frische Pilze scharf anbraten, beiseite stellen.',
      'Reis in derselben Pfanne glasig dünsten.',
      'Mit Wein ablöschen. Reduzieren lassen.',
      'Pilzsud und heißen Fond kellenweise zugeben.',
      'Nach 18 Min: Pilze, Butter und Käse kräftig unterrühren (Mantecare).'
    ]
  },
  {
    id: '3',
    titel: 'Royal Shakshuka',
    untertitel: 'Frühstück für Götter',
    beschreibung: 'Pochierte Eier in einer reichhaltigen, würzigen Tomatensauce mit Harissa und Feta.',
    bild: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&q=80&w=1200',
    zeit: '25 Min',
    portionen: 2,
    kalorien: 380,
    kategorie: 'Frühstück',
    favorit: true,
    tags: ['One Pot', 'Low Carb', 'Spicy'],
    zutaten: [
      { name: 'Dosen-Tomaten (San Marzano)', menge: 1, einheit: 'Dose' },
      { name: 'Eier (Bio)', menge: 4, einheit: 'Stk' },
      { name: 'Rote Paprika', menge: 1, einheit: 'Stk' },
      { name: 'Zwiebel', menge: 1, einheit: 'Stk' },
      { name: 'Harissa Paste', menge: 1, einheit: 'EL' },
      { name: 'Feta', menge: 100, einheit: 'g' },
      { name: 'Kreuzkümmel', menge: 1, einheit: 'TL' },
    ],
    anleitung: [
      'Zwiebeln und Paprika weich dünsten.',
      'Gewürze und Harissa kurz mitrösten.',
      'Tomaten dazu, zerdrücken und 10 Min einköcheln.',
      'Mulden formen, Eier hineinschlagen.',
      'Deckel drauf. 5-7 Min stocken lassen.',
      'Mit Feta und Koriander garnieren.'
    ]
  }
];

const VORRAT_ITEMS = [
  { id: 1, name: 'Reis', menge: '2', einheit: 'kg', icon: '🍚' },
  { id: 2, name: 'Nudeln', menge: '500', einheit: 'g', icon: '🍝' },
  { id: 3, name: 'Olivenöl', menge: '1', einheit: 'L', icon: '🫒' },
  { id: 4, name: 'Dosentomaten', menge: '4', einheit: 'Dosen', icon: '🥫' },
  { id: 5, name: 'Mehl', menge: '800', einheit: 'g', icon: '🌾' },
];

// --- COMPONENTS ---

const NavButton = ({ icon: Icon, label, active, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium transition-all duration-200 group ${
      active 
        ? 'bg-zinc-900 text-white shadow-md shadow-zinc-200' 
        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
    }`}
  >
    <Icon size={18} strokeWidth={2} className={`transition-colors ${active ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-900'}`} />
    {label}
    {count && (
      <span className={`ml-auto text-xs py-0.5 px-2 rounded-full ${active ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'}`}>
        {count}
      </span>
    )}
  </button>
);

const SectionHeader = ({ label }) => (
  <div className="px-3 mt-6 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
    {label}
  </div>
);

// --- SECTIONS ---

const Dashboard = ({ onSelect }) => {
  const featured = REZEPTE[0];
  
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Guten Abend, Chef.</h1>
          <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
            Dein persönliches Koch-Archiv ist bereit. Du hast 3 Mahlzeiten für diese Woche geplant.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Suchen..." 
              className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all w-64"
            />
          </div>
          <button className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Featured Recipe */}
      <section 
        onClick={() => onSelect(featured)}
        className="group relative h-[400px] w-full rounded-2xl overflow-hidden cursor-pointer bg-zinc-100 border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-500"
      >
        <div className="absolute inset-0">
          <img 
            src={featured.bild} 
            alt={featured.titel} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-900/40 to-transparent" />
        </div>
        
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-xl text-white">
          <div className="flex gap-2 mb-4 opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75">
            {featured.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/10 backdrop-blur border border-white/20 rounded text-[10px] font-bold tracking-wider uppercase">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-bold mb-3 tracking-tight leading-tight">{featured.titel}</h2>
          <p className="text-zinc-200 text-lg leading-relaxed line-clamp-2 mb-8 font-light">
            {featured.beschreibung}
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-300">
            <span className="flex items-center gap-2"><Clock size={16}/> {featured.zeit}</span>
            <span className="flex items-center gap-2"><Flame size={16}/> {featured.kalorien} kcal</span>
            <span className="flex items-center gap-2 group-hover:text-white transition-colors">
              Rezept öffnen <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </section>

      {/* Recent Recipes Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-zinc-900">Neueste Rezepte</h3>
          <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 uppercase tracking-wide">Alle ansehen</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REZEPTE.slice(1).map(recipe => (
            <div 
              key={recipe.id} 
              onClick={() => onSelect(recipe)}
              className="group cursor-pointer bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-100 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden bg-zinc-100">
                <img 
                  src={recipe.bild} 
                  alt={recipe.titel} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {recipe.favorit && (
                  <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm p-1.5 rounded-full text-white shadow-sm">
                    <Heart size={12} fill="currentColor"/>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                  <Maximize2 size={14} className="text-zinc-700"/>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2 flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{recipe.kategorie}</span>
                  <span className="text-[10px] text-zinc-400 font-medium">{recipe.zeit}</span>
                </div>
                <h4 className="text-lg font-bold text-zinc-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{recipe.titel}</h4>
                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {recipe.beschreibung}
                </p>
                <div className="pt-4 border-t border-zinc-50 flex items-center justify-between text-xs font-medium text-zinc-400">
                   <span>{recipe.portionen} Portionen</span>
                   <span className="group-hover:translate-x-1 transition-transform">Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const FavoritesView = ({ onSelect }) => {
  const favoriten = REZEPTE.filter(r => r.favorit);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="border-b border-zinc-100 pb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Meine Favoriten</h1>
        <p className="text-zinc-500 text-sm">Die Gerichte, die immer gelingen.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriten.map(recipe => (
          <div key={recipe.id} onClick={() => onSelect(recipe)} className="cursor-pointer group">
             <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative">
               <img src={recipe.bild} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt=""/>
               <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500">
                 <Heart size={14} fill="currentColor"/>
               </div>
             </div>
             <h3 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{recipe.titel}</h3>
             <span className="text-xs text-zinc-500">{recipe.zeit} • {recipe.kalorien} kcal</span>
          </div>
        ))}
        
        {/* Empty State visual if no favorites */}
        {favoriten.length === 0 && (
           <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-100 rounded-xl">
              <Heart className="mx-auto text-zinc-300 mb-2" size={32} />
              <p className="text-zinc-500 text-sm">Noch keine Favoriten markiert.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const PantryView = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <div className="flex justify-between items-end border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Vorrat</h1>
          <p className="text-zinc-500 text-sm">Verwalte, was du bereits zuhause hast.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">
          <Plus size={14} /> Eintrag
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VORRAT_ITEMS.map(item => (
          <div key={item.id} className="flex items-center p-4 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm border border-zinc-100 mr-4">
              {item.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-zinc-900 text-sm">{item.name}</h4>
              <p className="text-xs text-zinc-500">Im Schrank</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-6 h-6 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors">
                <Minus size={12} />
              </button>
              <span className="text-sm font-medium tabular-nums w-12 text-center">{item.menge} <span className="text-zinc-400 text-xs">{item.einheit}</span></span>
              <button className="w-6 h-6 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors">
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- RECIPE DETAIL PAGE (Embedded) ---

const RecipeDetailPage = ({ recipe, onBack }) => {
  const [scale, setScale] = useState(1);
  const [checked, setChecked] = useState(new Set());
  const [isFavorite, setIsFavorite] = useState(recipe.favorit);

  const toggleCheck = (idx) => {
    const next = new Set(checked);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setChecked(next);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-white min-h-full">
      
      {/* Navigation Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-0 py-4 mb-6 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors px-2 rounded-lg hover:bg-zinc-50 py-1"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Zurück</span>
        </button>
        <div className="flex gap-2">
           <button onClick={() => setIsFavorite(!isFavorite)} className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}>
             <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
           </button>
           <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><Printer size={18} /></button>
           <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><Share2 size={18} /></button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-24">
        {/* Header Section */}
        <div className="mb-10">
          <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden mb-8 shadow-sm relative group">
             <img src={recipe.bild} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={recipe.titel} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
          
          <div className="flex flex-col gap-4">
             <div className="flex flex-wrap gap-2">
               <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-wider">{recipe.kategorie}</span>
               {recipe.tags.map(tag => (
                 <span key={tag} className="px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500 text-xs font-medium">{tag}</span>
               ))}
             </div>
             
             <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.1]">{recipe.titel}</h1>
             <p className="text-lg text-zinc-500 leading-relaxed max-w-2xl">{recipe.beschreibung}</p>
             
             <div className="flex items-center gap-8 py-6 border-y border-zinc-100 mt-2">
                <div className="flex flex-col gap-1">
                   <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Zeit</span>
                   <div className="flex items-center gap-2 font-medium text-zinc-900">
                     <Clock size={18} className="text-zinc-400" /> {recipe.zeit}
                   </div>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Kalorien</span>
                   <div className="flex items-center gap-2 font-medium text-zinc-900">
                     <Flame size={18} className="text-zinc-400" /> {recipe.kalorien}
                   </div>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Portionen</span>
                   <div className="flex items-center gap-2 font-medium text-zinc-900">
                     <Users size={18} className="text-zinc-400" /> {recipe.portionen * scale}
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12">
          
          {/* Ingredients Column */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-zinc-900">Zutaten</h3>
                <div className="flex items-center bg-zinc-50 rounded-lg border border-zinc-200 p-0.5">
                    <button onClick={() => setScale(Math.max(0.5, scale - 0.5))} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded shadow-sm text-zinc-500"><Minus size={12}/></button>
                    <span className="w-8 text-center text-xs font-bold tabular-nums">{scale}x</span>
                    <button onClick={() => setScale(scale + 0.5)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded shadow-sm text-zinc-500"><Plus size={12}/></button>
                </div>
              </div>

              <div className="bg-zinc-50/50 rounded-2xl p-6 border border-zinc-100 space-y-1">
                {recipe.zutaten.map((z, i) => (
                  <label 
                    key={i} 
                    className={`flex items-start gap-3 py-2 cursor-pointer group select-none transition-all duration-300 ${checked.has(i) ? 'opacity-40' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={checked.has(i)}
                      onChange={() => toggleCheck(i)}
                    />
                    <div className="mt-1 w-5 h-5 rounded border border-zinc-300 bg-white peer-checked:bg-zinc-900 peer-checked:border-zinc-900 flex items-center justify-center shrink-0 transition-colors group-hover:border-zinc-400 shadow-sm">
                      <Check size={12} className="text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-zinc-900 block peer-checked:line-through">{z.menge * scale} {z.einheit}</span>
                      <span className="text-zinc-600 font-medium peer-checked:line-through decoration-zinc-400">{z.name}</span>
                    </div>
                  </label>
                ))}
              </div>

              <button className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                 <ShoppingBag size={16} /> Zutaten einkaufen
              </button>
            </div>
          </div>

          {/* Instructions Column */}
          <div className="space-y-8">
            <h3 className="font-bold text-lg text-zinc-900">Zubereitung</h3>
            <div className="space-y-10 relative pl-4">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-200" />
              {recipe.anleitung.map((step, i) => (
                <div key={i} className="relative pl-8 group">
                   <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white border-2 border-zinc-200 text-[10px] font-bold text-zinc-400 flex items-center justify-center z-10 group-hover:border-zinc-900 group-hover:text-zinc-900 transition-colors shadow-sm">
                     {i + 1}
                   </div>
                   <p className="text-zinc-700 leading-7 text-base md:text-lg group-hover:text-zinc-900 transition-colors">
                     {step}
                   </p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-green-50 border border-green-100 rounded-2xl flex gap-4">
               <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                 <CheckCircle2 size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-green-900 text-sm mb-1">Fertig gekocht?</h4>
                 <p className="text-green-800 text-sm leading-relaxed">Markiere das Gericht als "Gekocht", um es in deine Historie aufzunehmen und den Vorrat anzupassen.</p>
                 <button className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm">
                   Abschließen
                 </button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---

export default function App() {
  const [view, setView] = useState('dashboard');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Helper to handle navigation
  const navigateToRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar - Enhanced & Organized */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-zinc-100 bg-white z-10">
        <div className="flex items-center gap-2 px-6 py-6 mb-2">
          <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center shadow-lg shadow-zinc-200">
            <ChefHat size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">SAVOUR.</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1">
            <SectionHeader label="Kochen" />
            <NavButton 
              icon={LayoutGrid} 
              label="Übersicht" 
              active={view === 'dashboard' && !selectedRecipe} 
              onClick={() => { setView('dashboard'); navigateBack(); }}
            />
            <NavButton 
              icon={BookOpen} 
              label="Rezepte" 
              active={view === 'recipes'} 
              onClick={() => { setView('recipes'); navigateBack(); }}
            />
            <NavButton 
              icon={Heart} 
              label="Favoriten" 
              active={view === 'favorites'} 
              onClick={() => { setView('favorites'); navigateBack(); }}
              count={REZEPTE.filter(r => r.favorit).length}
            />
            <NavButton 
              icon={Calendar} 
              label="Wochenplan" 
              active={view === 'planner'} 
              onClick={() => { setView('planner'); navigateBack(); }}
            />
          </nav>

          {/* Household Navigation */}
          <nav className="space-y-1">
            <SectionHeader label="Haushalt" />
            <NavButton 
              icon={ShoppingBag} 
              label="Einkauf" 
              active={view === 'shop'} 
              onClick={() => { setView('shop'); navigateBack(); }}
            />
            <NavButton 
              icon={Package} 
              label="Vorrat" 
              active={view === 'pantry'} 
              onClick={() => { setView('pantry'); navigateBack(); }}
            />
          </nav>

          {/* Tags / Collections (Mock) */}
           <nav className="space-y-1">
            <SectionHeader label="Sammlungen" />
            <NavButton icon={Hash} label="Vegetarisch" onClick={() => {}} />
            <NavButton icon={Hash} label="Schnell & Einfach" onClick={() => {}} />
          </nav>
        </div>

        {/* User / Settings Footer */}
        <div className="p-4 border-t border-zinc-50 bg-white">
          <button 
             onClick={() => { setView('settings'); navigateBack(); }}
             className={`flex items-center gap-3 w-full p-2 rounded-xl transition-colors ${view === 'settings' ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-400 flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
            <div className="text-left flex-1 overflow-hidden">
               <p className="text-xs font-bold text-zinc-900 truncate">John Doe</p>
               <p className="text-[10px] text-zinc-500 truncate">Pro Account</p>
            </div>
            <Settings size={16} className="text-zinc-400" />
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
         <span className="font-bold text-lg tracking-tight">SAVOUR.</span>
         <button className="p-2 bg-zinc-50 rounded-full"><Search size={18} className="text-zinc-600"/></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-white relative">
        <div className="max-w-6xl mx-auto p-4 md:p-10 lg:p-12 pb-24 md:pb-12 min-h-screen">
          
          {/* Main View Logic Switch */}
          {selectedRecipe ? (
             <RecipeDetailPage recipe={selectedRecipe} onBack={navigateBack} />
          ) : (
            <>
              {view === 'dashboard' && <Dashboard onSelect={navigateToRecipe} />}
              {view === 'favorites' && <FavoritesView onSelect={navigateToRecipe} />}
              {view === 'pantry' && <PantryView />}
              
              {/* Placeholder Views */}
              {(view === 'recipes' || view === 'planner' || view === 'shop' || view === 'settings') && (
                <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-300 animate-in fade-in zoom-in-95">
                  <Utensils size={48} className="mb-4 opacity-50"/>
                  <h3 className="text-zinc-900 font-bold text-lg mb-1">In Arbeit</h3>
                  <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">Dieser Bereich wird bald verfügbar sein.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-6 py-3 flex justify-between z-40 pb-safe">
        <button onClick={() => { setView('dashboard'); navigateBack(); }} className={`flex flex-col items-center gap-1 ${view === 'dashboard' && !selectedRecipe ? 'text-zinc-900' : 'text-zinc-400'}`}>
          <LayoutGrid size={22} strokeWidth={(view === 'dashboard' && !selectedRecipe) ? 2.5 : 2} />
        </button>
        <button onClick={() => { setView('favorites'); navigateBack(); }} className={`flex flex-col items-center gap-1 ${view === 'favorites' ? 'text-zinc-900' : 'text-zinc-400'}`}>
          <Heart size={22} strokeWidth={view === 'favorites' ? 2.5 : 2} />
        </button>
        <button onClick={() => { setView('pantry'); navigateBack(); }} className={`flex flex-col items-center gap-1 ${view === 'pantry' ? 'text-zinc-900' : 'text-zinc-400'}`}>
          <Package size={22} strokeWidth={view === 'pantry' ? 2.5 : 2} />
        </button>
        <button onClick={() => { setView('shop'); navigateBack(); }} className={`flex flex-col items-center gap-1 ${view === 'shop' ? 'text-zinc-900' : 'text-zinc-400'}`}>
          <ShoppingBag size={22} strokeWidth={view === 'shop' ? 2.5 : 2} />
        </button>
      </nav>

    </div>
  );
}
// Városi park location scenes and logic

const varosiparkScenes = [
    {type:'narrative', text:'Megérkeztél a városi parkba. A rendszerint nyugodt és csendes helyszínt most városi őrök vették körül. A park közepén egy pad mellett fekszik a holtest, ilyen távolról nem tudod megállapítani, hogy ki lehet az, és mi történhetett.', once: true},
    {type:'narrative', text:'Lucas fő őr int neked, hogy gyere közelebb.', once: true},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'lucas', label:'Lucas fő őr', nextScene: 3}
    ], once: true},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'Jó reggelt Alex detektív! Szükségünk van a segítségére ebben az ügyben.'},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'A reggeli körjáratomban voltam, mikor észrevettem a testet a padnál. Azonnal értesítettem Gerald-ot, hogy hívja ide Önt. Régen nem volt már gyilkossági ügy, így remélem segíteni tud nekünk a nyomozásban.'},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'A helyszínt nem kutattuk át, várjuk az Ön utasításait.'},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'lucas2', label:'Lucas fő őr', nextScene: 3, condition: 'lucasAvailable'},
        {id:'investigate', label:'Helyszín átnézése', nextScene: 7},
        {id:'analyze', label:'Tárgyak elemzése', nextScene: 8, condition: 'investigationCompleted'}
    ]},
    {type:'investigation', image: 'pictures/nyom.png', buttonLabel: 'Helyszín átnézésének befejezése', nextScene: 6},
    {type:'choices', prompt:'Mit talált detektív?', image: 'pictures/characters/lucas.png', choices:[
        {id:'nyom1', label:'Kalapács', nextScene: 9},
        {id:'nyom2', label:'Kendő', nextScene: 10},
        {id:'nyom3', label:'Gyümölcsök', nextScene: 11},
        {id:'nyom4', label:'Fapálca', nextScene: 12},
        {id:'nyom5', label:'Kő', nextScene: 12},
        {id:'nyom6', label:'Falevél', nextScene: 12},
        {id:'nyom7', label:'Pad deszkája', nextScene: 12},
        {id:'nyom8', label:'Virág', nextScene: 12},
        {id:'nyom9', label:'Kötél', nextScene: 12},
        {id:'nyom10', label:'Szövet cafat', nextScene: 12},
        {id:'nyom11', label:'Fűszál', nextScene: 12},
        {id:'nyom12', label:'Fakéreg', nextScene: 12},
        {id:'nyom13', label:'Moha', nextScene: 12},
        {id:'nyom14', label:'Kis bot', nextScene: 12},
        {id:'nyom15', label:'Rozsdás szög', nextScene: 12},
        {id:'nyom16', label:'Törött cserép', nextScene: 12},
        {id:'nyom17', label:'Madártoll', nextScene: 12},
        {id:'finish', label:'Nyomok keresésének befejezése', nextScene: 13}
    ]},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'Ez a kalapács véres. Valószínűleg ez lehet a gyilkos eszköze.', addItem: 'Kalapács', nextScene: 8},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'Ez a kendő a William báró címerét tartalmazza. Lehet a szolgáló nő a családnak dolgozott.', addItem: 'Kendő', location: 'Báró birtoka', nextScene: 8},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'A gyümölcsök még frissnek tűnnek. Lehet a piacról jött éppen hazafele mikor megtámadták.', addItem: 'Gyümölcsök', location: 'Piac', nextScene: 8},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'Ez a tárgy nem érdekes a nyomozás ügyében.', nextScene: 8},
    {type:'narrative', image: 'pictures/characters/lucas.png', text:'Ebben az esetben hogyha nincs már szükség rám akkor visszatérnék az őrsre.', location: 'Városi őrség', nextScene: 14},
    {type:'narrative', text:'Lucas városi őr az őrségen van, ha bármi kérdésed van ott keresd.', nextScene: 6, setState: {lucasAvailable: false}},
    {type:'narrative', text:'Egy városi őr őrzi a gyilkossági helyszínt, nem állít meg abban hogy közelebb mehess a tetthelyhez.', nextScene: 6}
];

const varosiparkBackground = 'pictures/varosipark.png';

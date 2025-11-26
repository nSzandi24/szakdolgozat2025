// Charlotte szobája location scenes and logic

const charlotteSzobaScenes = [
    {type:'narrative', text:'Belépsz Charlotte szobájába. A szoba egyszerű, de rendezett.'},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'investigate', label:'Helyszín átnézése', nextScene: 2},
        {id:'analyze', label:'Tárgyak elemzése', nextScene: 3, condition: 'investigationCompleted'}
    ]},
    {type:'investigation', image: 'pictures/nyom2.png', buttonLabel: 'Helyszín átnézésének befejezése', nextScene: 1},
    {type:'choices', prompt:'Mit találsz?', choices:[
        {id:'nyom1', label:'Ágy', nextScene: 4},
        {id:'nyom2', label:'Gyapjú takaró', nextScene: 4},
        {id:'nyom3', label:'Párna', nextScene: 4},
        {id:'nyom4', label:'Bogyók', nextScene: 7},
        {id:'nyom5', label:'Gyertya', nextScene: 4},
        {id:'nyom6', label:'Foltok', nextScene: 10},
        {id:'nyom7', label:'Fazék', nextScene: 4},
        {id:'nyom8', label:'Tál', nextScene: 4},
        {id:'nyom9', label:'Vászon ruha', nextScene: 4},
        {id:'nyom10', label:'Fakanál', nextScene: 4},
        {id:'nyom11', label:'Vödör', nextScene: 4},
        {id:'nyom12', label:'Mosdótál', nextScene: 4},
        {id:'nyom13', label:'Tinta foltok', nextScene: 9},
        {id:'nyom14', label:'Kendő', nextScene: 4},
        {id:'nyom15', label:'Faláb', nextScene: 4},
        {id:'nyom16', label:'Szalmaszál', nextScene: 4},
        {id:'nyom17', label:'Láda', nextScene: 5},
        {id:'finish', label:'Nyomok keresésének befejezése', nextScene: 12}
    ]},
    {type:'narrative', text:'Ez a tárgy nem érdekes a nyomozás ügyében.', nextScene: 3},
    {type:'narrative', text:'A ládát átkutatva találsz benne egy naplót. Van rajta egy lakat, de kulcsod nincs hozzá.'},
    {type:'narrative', text:'Célszerű lenne hazamenned és otthon megpróbálnod feltörni a lakatot a naplón az otthoni szerszámjaiddal.', addItem: 'Napló', setState: {hasNaplo: true}, nextScene: 3},
    {type:'narrative', text:'Ezek gyógyszereknek tűnnek. Tudásod alapján tudod, hogy ilyen nem lehet szerezni gyógyfüveseknél sem. Talán emiatt szökött ki az egyik éjszaka.'},
    {type:'narrative', text:'Célszerű lenne elmenned a nyomornegyedbe utána nézni ennek.', addItem: 'Furcsa bogyók', location: 'Nyomornegyed', nextScene: 3},
    {type:'narrative', text:'Ezek tintafoltok az asztalon. Úgy tűnik, mintha valaki írt volna valamit, de az a könyv nincsen az asztalon.', nextScene: 3},
    {type:'narrative', text:'Ezek a foltok olyan mintha vezetne valahova. Be az ágy alá.'},
    {type:'narrative', text:'Az ágy alatt találsz egy kis zacskót melyben néhány cukorkának tűnő dolgot találsz. A zacskón van egy jel ami a Ghostskin-re utal. A cukorkák hasonlítanak arra amit a báró említett.', addItem: 'Furcsa cukorkák', nextScene: 3},
    {type:'narrative', text:'Ideje minnél gyorsabban elmenned a helyszínről mielőtt valaki meglátna. Lucas fő őrnek lesz valamilyen információja erről a Ghostskin-ről.', nextScene: 1, setState: {ghostskinInfoNeeded: true}}
];

const charlotteSzobaBackground = 'pictures/charlotte_szoba.png';
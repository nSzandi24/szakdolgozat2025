// Otthon location scenes and logic

const otthonScenes = [
    {type:'narrative', text:'Kalandod egy középkori városban kezdődik Szirtkikötőben. E kisváros jelentős helyszín az ország számára mert egy fontos kikötőváros, ahol rengeteg kereskedelem zajlik. Egy fejlett város, így mindenféle emberrel találkozhatsz. Itt élsz te is mint egy visszavonult városi őr. Legutolsó ügyedben olyan személyeket kerestél meg és kérdeztél ki, akiket talán nem kellett volna, így úgy döntöttél inkább visszavonulsz és alkalomadtán egy-egy ügyet egyedül kinyomozól. De az itteni lakosok ismernek a városban, tisztelték a munkádat így az emberek többsége barátságosan és segítően fogad. A mai napod is átlagosan kezdődik, otthon vagy még mikor a városi őr dübörög az ajtódon és a nevedet kiáltozza segítségért..', once: true},
    {type:'narrative', text:'Alex detektív! Kérem nyissa ki az ajtót, sürgős ügyben keresem!', once: true},
    {type:'narrative', text:'Ahogy kinyitod az ajtót, Gerald-val találod szembe magadat, az egyik városi őrrel. Eléggé liheg és arcáról rémületet tudsz leolvasni.', once: true},
    {type:'narrative', image: 'pictures/characters/gerald.png',text:'Alex detektív! Kérem azonnal jöjjön velem, találtunk egy holtestet a parkban, szükségünk lenne az Ön segítségére!', location: 'Városi park', once: true},
    {type:'narrative', image: 'pictures/characters/gerald.png',text:'Részleteket sajnos nem tudok, a helyszínen vár Önre Lucas fő őr és majd eligazítja az ügyben.', once: true},
    {type:'narrative', text:'Otthon vagy. Nyugalom vesz körül.'},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'naplo', label:'Napló vizsgálata', nextScene: 7, requiresItem: 'Napló'},
        {id:'rest', label:'Pihenés', nextScene: 6}
    ]},
    {type:'narrative', text:'Előveszed a naplót amit Charlotte szobájában találtál. A lakaton még mindig ott van.'},
    {type:'narrative', text:'Szerszámaiddal megpróbálod feltörni a lakatot.'},
    {type:'narrative', text:'Néhány perc után sikerül kinyitnod a naplót.'},
    {type:'narrative', text:'A napló belsejében Charlotte feljegyzéseit olvasod. Az első bejegyzések normálisnak tűnnek, napi rutinjáról, Sebastianról és a báró birtokáról ír.'},
    {type:'narrative', text:'Aztán egy bejegyzés megváltozik a hangneme: "Ma találkoztam vele újra. A Ghostskin-t különös ajánlatot tett. Azt mondja, hogy a szerei segítenek az álmatlanságomon és a fáradtságomon. Nem tudom, higyjek-e neki, de olyan kétségbeesett vagyok már..."'},
    {type:'narrative', text:'Egy másik bejegyzés: "A bogyók tényleg segítenek. Sebastiannak is adtam belőle, mert láttam rajta a fáradtságot. De valami nem stimmel... egyre furcsább dolgokat látok, hallok..."'},
    {type:'narrative', text:'Az utolsó bejegyzés: "Nem bírom tovább. A Ghostskin- követel tőlem valamit cserébe. Azt mondja, ha nem fizetek, Sebastian fog... Nem értem mit akar, de félek. Holnap elmegyek a piacra, talán ott találok segítséget..."'},
    {type:'narrative', text:'A napló további részei üresek. Ez volt Charlotte utolsó bejegyzése.'},
    {type:'narrative', text:'Most már világos, hogy Charlotte és Sebastian is a Ghostskin áldozatai voltak. Meg kell találnod ezt az embert.', removeItem: 'Napló', setState: {naploRead: true}, nextScene: 6},
    
];

const otthonBackground = 'pictures/home.png';

// Otthon location scenes and logic

const otthonScenes = [
    {type:'narrative', text:'Kalandod egy középkori városban kezdődik Szirtkikötőben. E kisváros jelentős helyszín az ország számára mert egy fontos kikötőváros, ahol rengeteg kereskedelem zajlik. Egy fejlett város, így mindenféle emberrel találkozhatsz. Itt élsz te is mint egy visszavonult városi őr. Legutolsó ügyedben olyan személyeket kerestél meg és kérdeztél ki, akiket talán nem kellett volna, így úgy döntöttél inkább visszavonulsz és alkalomadtán egy-egy ügyet egyedül kinyomozól. De az itteni lakosok ismernek a városban, tisztelték a munkádat így az emberek többsége barátságosan és segítően fogad. A mai napod is átlagosan kezdődik, otthon vagy még mikor a városi őr dübörög az ajtódon és a nevedet kiáltozza segítségért..', once: true},
    {type:'narrative', text:'Alex detektív! Kérem nyissa ki az ajtót, sürgős ügyben keresem!', once: true},
    {type:'narrative', text:'Ahogy kinyitod az ajtót, Gerald-val találod szembe magadat, az egyik városi őrrel. Eléggé liheg és arcáról rémületet tudsz leolvasni.', once: true},
    {type:'narrative', image: 'pictures/characters/gerald.png',text:'Alex detektív! Kérem azonnal jöjjön velem, találtunk egy holtestet a parkban, szükségünk lenne az Ön segítségére!', location: 'Városi park', once: true},
    {type:'narrative', image: 'pictures/characters/gerald.png',text:'Részleteket sajnos nem tudok, a helyszínen vár Önre Lucas fő őr és majd eligazítja az ügyben.', once: true},
    {type:'narrative', text:'Otthon vagy. Nyugalom vesz körül.'},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'naplo', label:'Napló vizsgálata (játék)', nextScene: 7, requiresItem: 'Napló', condition: 'notAbandonedGame2'},
        {id:'rest', label:'Pihenés', nextScene: 25}
    ]},
    
    {type:'narrative', text:'Előveszed a naplót és leülsz az asztalhoz hogy megvizsgáld közelebbről.'},
    {type:'narrative', text:'A napló lakatja zárva van, de szerencsére nálad vannak a szerszámaid amikkel megpróbálod feltörni a lakatot.'},
    {type:'narrative', text:'Elkezded feltörni a lakatot...', action: 'redirect', redirectUrl: '../game2.html'},
    
    // Sikeres napló feltörés (game2Result === 'success')
    {type:'narrative', text:'Sikerült feltörnöd a napló lakatját! A bonyolult mechanizmus végül engedett.', condition: 'game2Success'},
    {type:'narrative', text:'A napló kinyílik előtted. Charlotte feljegyzései végre olvashatók...'},
    {type:'narrative', text:'A napló belsejében Charlotte feljegyzéseit olvasod. Az első bejegyzések egyszerű cselédlányként való mindennapjairól szólnak - Sebastian gondozásáról, a báró birtokán végzett munkáiról, és a nyugodt életéről.'},
    {type:'narrative', text:'Aztán megjelenik egy új név a bejegyzésekben: "Ma ismét találkoztam Thomas-szal a kertben. Olyan kedves volt velem. Egyre többet beszélgetünk, és érzem, hogy valami különleges van köztünk..."'},
    {type:'narrative', text:'A következő bejegyzések már nyíltan a szerelmükről szólnak: "Thomas azt mondta, szeret. A szívem úgy dobog, amikor meglátom. Tudom, hogy veszélyes ez, de nem tudok ellenállni az érzéseimnek. Még soha nem éreztem ilyet..."'},
    {type:'narrative', text:'Aztán a hangnem megváltozik: "Elkezdtem rosszul lenni. Hányingerem van reggelente, és kimaradt a havi vérzésem. Félek... félek attól, amire gondolok. Mit fogok csinálni? Házas sem vagyok..."'},
    {type:'narrative', text:'Egy újabb bejegyzés: "Már biztos vagyok benne. Terhes vagyok. Thomas gyermekét hordom. De olyan fájdalmaim vannak, amiket nem tudok elviselni. Segítségre van szükségem, de nem mehetek orvoshoz... a báró megtudná..."'},
    {type:'narrative', text:'Majd egy reményteljes bejegyzés: "Találkoztam valakivel, akit Ghostskin-nek hívnak. Gyógyszert adott nekem a fájdalmaim ellen. Azt mondta, ez segíteni fog. És tényleg! A fájdalmak enyhültek."'},
    {type:'narrative', text:'Egy bejegyzés ami sötét és kétségbeesett: "A Ghostskin ma odajött hozzám a piacon. Azt mondta, itt az ideje fizetni a kapott segítségért. Balszerencsémre pont velem volt Sebastian is. Adott neki édességet, és elmondta, hogy neki ez ajándék számára. Végül azzal zárta a beszélgetést, hogy hamarosan újra találkozunk... Nem tudom mire utalhatott ezzel..."'},
    {type:'narrative', text:'Ez az utolsó bejegyzés a naplóban: "Kénytelen leszek eladni valamit a piacon, hogy kifizethessem a Ghostskin követelését. Következő piaci napon érdeklődök, hogy mit tudok eladni."'},
    {type:'narrative', text:'A napló további részei üresek. Ez volt Charlotte utolsó bejegyzése.'},
    {type:'narrative', text:'Most már világos a kép: Charlotte és Thomas szerelme, a terhesség, és a Ghostskin zsarolása. De Sebastian-ról nem tudtál meg új információt.', removeItem: 'Napló', setState: {naploRead: true, game2Played: true}, nextScene: 6},
    
    // Sikertelen napló feltörés (game2Result === 'failure')  
    {type:'narrative', text:'Hiába próbálkoztál, a napló lakatja túl bonyolult. Nem sikerült feltörnöd.', condition: 'game2Failure'},
    {type:'narrative', text:'A szerszámod beletört a lakatba a többszöri próbálkozás során. Már nem tudod kinyitni a naplót.', setState: {game2Played: true, game2Abandoned: true}, nextScene: 6},
    
    // Pihenés
    {type:'narrative', text:'Úgy döntesz, hogy pihensz egy kicsit otthon. A nyomozás fárasztó, és szükséged van az energiára a folytatáshoz.'},
    {type:'narrative', text:'Pihenés közben átgondolod a nyomozás eddigi részleteit és a következő lépéseidet.', nextScene: 6}
];

const otthonBackground = 'pictures/home.png';

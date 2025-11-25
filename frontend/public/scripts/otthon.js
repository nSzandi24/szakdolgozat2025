// Otthon location scenes and logic

const otthonScenes = [
    {type:'narrative', text:'Kalandod egy középkori városban kezdődik Szirtkikötőben. E kisváros jelentős helyszín az ország számára mert egy fontos kikötőváros, ahol rengeteg kereskedelem zajlik. Egy fejlett város, így mindenféle emberrel találkozhatsz. Itt élsz te is mint egy visszavonult városi őr. Legutolsó ügyedben olyan személyeket kerestél meg és kérdeztél ki, akiket talán nem kellett volna, így úgy döntöttél inkább visszavonulsz és alkalomadtán egy-egy ügyet egyedül kinyomozól. De az itteni lakosok ismernek a városban, tisztelték a munkádat így az emberek többsége barátságosan és segítően fogad. A mai napod is átlagosan kezdődik, otthon vagy még mikor a városi őr dübörög az ajtódon és a nevedet kiáltozza segítségért..', once: true},
    {type:'narrative', text:'Alex detektív! Kérem nyissa ki az ajtót, sürgős ügyben keresem!', once: true},
    {type:'narrative', text:'Ahogy kinyitod az ajtót, Gerald-val találod szembe magadat, az egyik városi őrrel. Eléggé liheg és arcáról rémületet tudsz leolvasni.', once: true},
    {type:'narrative', image: 'pictures/characters/gerald.png',text:'Alex detektív! Kérem azonnal jöjjön velem, találtunk egy holtestet a parkban, szükségünk lenne az Ön segítségére!', location: 'Városi park', once: true},
    {type:'narrative', image: 'pictures/characters/gerald.png',text:'Részleteket sajnos nem tudok, a helyszínen vár Önre Lucas fő őr és majd eligazítja az ügyben.', once: true},
    {type:'narrative', text:'Otthon vagy. Nyugalom vesz körül.'}
];

const otthonBackground = 'pictures/home.png';

// Piac location scenes and logic

const piacScenes = [
    {type:'narrative', text:'Megérkeztél a piacra. A tér nyüzsög az élettel, árusok kiabálják portékáikat.'},
    {type:'narrative', text:'A piac tele van különféle árukkal: friss zöldségekkel, fűszerekkel és kézműves termékekkel.'},
    {type:'narrative', text:'A gyilkosság helyszínéről származó gyümölcsök itt vehette az áldozat, érdemes lehet körülnézni az árusok között.'},
    {type:'narrative', text:'Feltünés mentesen kellene nyomoznod mivel a gyilkosságnak még nem ment híre.'},
    {type:'narrative', text:'Ebben az időszakban elég kevés helyen lehet gyümölcsöt kapni. Kiszúrsz egy árust, aki friss gyümölcsöket kínál eladásra, mind olyan mint a gyilkosság helyszínén találtak. A standja úgy néz ki mintha éppen kirabolták volna.'},
    {type:'narrative', text:'Odamész az árushoz.'},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'ask_fruits', label:'Megszólítod az árust', nextScene: 7, condition: 'notAbandonedGame'},
        {id:'ask_customers', label:'Körülnézel a piacon', nextScene: 27},
    ]},
    {type:'narrative', text:'Odamész az árushoz, aki éppen nagy erővel pakolja a pultját de felnéz rád és mosolyogva fogad.'},
    {type:'narrative', text:'Jó napot! Mit parancsol? Friss gyümölcsöket kínálok, ennél jobbat nem talál.', image:'pictures/characters/piaci_arus.png'},
    {type:'choices', prompt:'Mit kérdezel?', image:'pictures/characters/piaci_arus.png', choices:[
        {id:'ask_sold', label:'Kérdezel hogy vásárolt ma itt egy cseléd', nextScene: 10},
        {id:'ask_quality', label:'Kérdezel mi történt a putjánál', nextScene: 13},
        {id:'help_packing', label:'Felajánlod a segítségedet a pakolásban (játék)', nextScene: 17, condition: 'piacIncidentHeard'},
        {id:'end_talk', label:'Befejezed a beszélgetést', nextScene: 6}
    ]},
    {type:'narrative', text:'A cselédről érdeklődsz, az áldozattról kihagyva azt a részt hogy meggyilkolták.'},
    {type:'narrative', text:'Na de kérem! Tudja maga hányan vásárolnak nálam? Ennél több információra lenne szükségem.', image:'pictures/characters/piaci_arus.png'},
    {type:'narrative', text:'Elég mérges lett az árus, inkább tovább pakolja a standot.', nextScene: 9},
    {type:'narrative', text:'Rákérdezel, hogy mi történt a pultjánál. Úgy néz ki mintha valaki szándékosan felborított volna néhány ládát amikben az áruk voltak.'},
    {type:'narrative', text:'Az árus arca elsötétedik és dühösen mesél.'},
    {type:'narrative', text:'Azok az átkozott ördögök! Talán 3-an vagy 4-en lehettek, néhány gyerek egyszercsak a semmiből megjelent folborították a ládákat és ellopták a földre esett gyümölcsöket.', image:'pictures/characters/piaci_arus.png'},
    {type:'narrative', text:'Mielőtt bármit tehettem volna máris eltűntek.', image:'pictures/characters/piaci_arus.png', nextScene: 9, setState: {piacIncidentHeard: true}},
    {type:'narrative', text:'Felajánlod a segítségedet az árusnak, hogy segíts visszapakolni a gyümölcsöket.'},
    {type:'narrative', text:'Az árusarca felderül és hálás mosollyal néz rád.'},
    {type:'narrative', text:'Ó, nagyon kedves öntől! Ez óriási segítség lenne!', image:'pictures/characters/piaci_arus.png', action: 'redirect', redirectUrl: 'game1.html'},
    {type:'narrative', text:'Maga tréfál velem? Ne rabolja tovább az időmet!', image:'pictures/characters/piaci_arus.png'},
    {type:'narrative', text:'Sikerült annyira felmérgelned az árust, hogy többé nem hajlandó rád figyelni.', nextScene: 6, setState: {piacMerchantAngry: true}},
    {type:'narrative', text:'Sikeresen segítettél az árusnak visszapakolni az összes gyümölcsöt.'},
    {type:'narrative', text:'Az árus hálás mosollyal néz rád.'},
    {type:'narrative', text:'Köszönöm szépen a segítségét! Nagyon hálás vagyok, ritka manapság az ilyen önzetlen segítség.', image:'pictures/characters/piaci_arus.png'},
    {type:'narrative', text:'Azok alapján mit a cseléd vásárolt és hogyan nézett ki ő csakis Charlotte kisasszony lehetett. Vele volt a báró gyermeke is Sebastian.', image:'pictures/characters/piaci_arus.png'},
    {type:'narrative', text:'Annál többet nem tudok mondani mint, hogy vásároltak tőlem és elmentek. Nem figyeltem, hogy merre vagy mi történthetett velük a továbbiakban. Nincs több információm.', nextScene: 9, setState: {piacGameWon: true}},
    {type:'narrative', text:'Körülnézel a piacon, és távolabb az egyik árus standjánál kiszúrsz 3 gyereket. Nem éppen úgy néznek ki mint akik vásárolni jöttek volna.'},
    {type:'narrative', text:'Elindulsz feléjük, de az egyik gyermek kiszúr és gyorsan eltűnnek a tömegben.', nextScene: 6}

];

const piacBackground = 'pictures/piac.png';

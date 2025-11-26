// Rendőrség location scenes and logic

const rendorsegScenes = [
    {type:'narrative', text:'Megérkeztél a rendőrőrsre. Az épület előtt városi őrök jönnek-mennek.'},
    {type:'narrative', text:'Belépsz az épületbe, ahol egy fogadópultnál egy őr áll. Elmondod neki, hogy Lucas fő őrrel szeretnél beszélni a gyilkossági ügyről.'},
    {type:'narrative', text:'Az őr bólint és int, hogy menj be a hátsó szobába ahol Lucas fő őr dolgozik.'},
    {type:'narrative', text:'Belépsz a szobába ahol Lucas fő őr éppen papírokat nézeget.'},
    {type:'narrative', text:'Lucas felnéz mikor belépsz és barátságosan üdvözöl.'},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'solution', label:'Ügy megoldása', nextScene: 6},
        {id:'sapadt', label:'Információ gyűjtés a Ghostskin-ról', nextScene: 7, condition: 'ghostskinInfoNeeded'},
    ]},
    {type:'narrative', text:'Lucas fő őr gratulál neked az ügy megoldásához. Köszönetet mond a segítségedért és elmondja, hogy a város hálás a munkádért.'},
    {type:'narrative', text:'Elmondod Lucas fő őrnek, hogy a nyomozás során rábukkantál egy Ghostskin nevű személyre, aki kapcsolatban állhat az üggyel.'},
    {type:'narrative', text:'Lucas elgondolkodik és bólint.'},
    {type:'narrative', text:'Igen, a Ghostskin... Azt a nevet már hallottam. Egy furcsa alak, aki a nyomornegyedben tartózkodik. Sokan félnek tőle, mert különös szereket árul.', image:'pictures/characters/lucas.png'},
    {type:'narrative', text:'Azt beszélik, hogy van valami titkos találkozóhelye, ahol az ügyfeleit fogadja. Ha meg akarod találni, a nyomornegyedben kell körülnézned.', image:'pictures/characters/lucas.png'},
    {type:'narrative', text:'De vigyázz vele! Sok információt tud, de azt nem tudjuk hogy Önnek ez előnyére vagy hátrányára fog válni.', image:'pictures/characters/lucas.png', nextScene: 5}

];

const rendorsegBackground = 'pictures/rendorseg.png';

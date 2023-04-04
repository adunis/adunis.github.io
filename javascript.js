import mustache from "https://cdn.skypack.dev/mustache@4.2.0";
import 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js';
import "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
import "./node_modules/jquery/dist/jquery.js";

var jsonData =  [{
    "name": "Blacksmith",
    "crystals": {
        "requires":
            [] ,
        "provides": ["soldier"
        ]
    },
    "stats": {
        "hp": 10,
        "mp": 5,
        "sp": 10,
        "hd": "1d6",
        "md":"1d4",
        "sd": "1d4"
    },
    "type": "character",
    "description": "<p>When you spend time working in your forge, choose one item to create and roll+Int. On a 10+, you successfully create the item to the best of your ability. Choose two options from the list below. On a 7-9, you successfully create the item, but choose one:</p><ul><li>The item is flawed in some way (the GM will tell you how)</li><li>The creation takes longer than expected</li><li>The creation requires rare or expensive materials</li></ul><p>On a miss, you fail to create the item and waste your materials.</p><p>Options:</p><ul><li>The item is of exceptional quality and gains a +1 bonus to damage or usefulness</li><li>The item has an interesting design or unique feature that sets it apart from other similar items</li><li>The item is created quickly and efficiently, taking half the expected time</li><li>The item is created using minimal materials, reducing the cost by half</li></ul></p>"
},
    {
        "name": "Squire",
        "crystals": {
            "requires": [],
            "provides": ["paladin"]
        },
        "stats": {
            "hp": 8,
            "mp": 2,
            "sp": 8,
            "hd": "1d8+1",
            "md":"1d4",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>As a squire, you are trained in the ways of chivalry and battle. You have the ability to assist a knight in combat or formal events. You gain the following abilities:</p><ul><li>+1 forward to your Protect move when assisting a knight</li><li>You may use your knowledge of heraldry to identify the banners of noble houses and important persons</li><li>If you have higher Charm than the knight you are assisting, you may take charge of a situation in their absence</li></ul>"
    },
    {
        "name": "Apprentice",
        "crystals": {
            "requires": [],
            "provides": ["wizard"]
        },
        "stats": {
            "hp": 6,
            "mp": 10,
            "sp": 6,
            "hd": "1d4+1",
            "md":"1d8",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>As an apprentice, you are learning the arcane arts from your master. You gain the following abilities:</p><ul><li>You are able to cast spells from your master's grimoire, if you have the MP to do so</li><li>You have knowledge of alchemy and can identify magical ingredients and substances</li><li>If you spend time studying, you can roll+Int to gain insight on a particular magical subject. On a 10+, you gain useful information. On a 7-9, you gain some information but also attract unwanted attention in the process</li></ul>"
    },
    {
        "name": "Street Criminal",
        "crystals": {
            "requires": [],
            "provides": ["rogue"]
        },
        "stats": {
            "hp": 5,
            "mp": 5,
            "sp": 8,
            "hd": "1d6+1",
            "md":"1d6",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>As a street criminal, you know how to make your way in the world by any means necessary. You gain the following abilities:</p><ul><li>You gain +1 forward when using the Move Silently or Pick Locks moves</li><li>You have knowledge of the criminal underworld and can gather information or contacts within it</li><li>If you spend time casing a location, you can roll+Wis to learn about its security measures. On a 10+, you gain useful information. On a 7-9, you gain some information but it comes with a complication</li></ul>"
    },
    {
        "name": "Village Hunter",
        "crystals": {
            "requires": [],
            "provides": ["ranger"]
        },
        "stats": {
            "hp": 8,
            "mp": 5,
            "sp": 8,
            "hd": "1d8",
            "md":"1d6",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>As a village hunter, you are skilled in tracking and hunting game in the nearby forests and fields. You gain the following abilities:</p><ul><li>You gain +1 forward when using the Track or Hunt moves</li><li>You have knowledge of the local flora and fauna, and can identify useful plants or animals</li><li>If you spend time studying a particular area, you can roll+Wis to learn about its wildlife and terrain. On a 10+, you gain useful information. On a 7-9, you gain some information but also attract unwanted attention in the process</li></ul>"
    },
    {
        "name": "Initiate",
        "crystals": {
            "requires": [],
            "provides": ["druid"]
        },
        "stats": {
            "hp": 6,
            "mp": 8,
            "sp": 6,
            "hd": "1d6",
            "md":"1d6",
            "sd": "1d8"
        },
        "type": "character",
        "description": "<p>As a groove initiate, you are part of a musical and spiritual tradition. You gain the following abilities:</p><ul><li>You gain +1 forward to your Charisma-based moves when performing music or dance</li><li>You have knowledge of various musical instruments and styles, and can identify their origins or influences</li><li>If you spend time practicing your music or meditation, you can roll+Wis to gain insights and inspiration. On a 10+, you gain useful information. On a 7-9, you gain some information but also expose yourself to a distracting or dangerous situation</li></ul>"
    },
    {
        "name": "Deacon",
        "crystals": {
            "requires": [],
            "provides": ["priest"]
        },
        "stats": {
            "hp": 8,
            "mp": 8,
            "sp": 6,
            "hd": "1d8",
            "md":"1d6",
            "sd": "1d4"
        },
        "type": "class",
        "description": "<p>As a deacon, you are a representative of your faith and its teachings. You gain the following abilities:</p><ul><li>You gain +1 forward to your Wisdom-based moves when dealing with matters of faith or morality</li><li>You have knowledge of religious texts and symbols, and can identify their meanings or applications</li><li>If you spend time studying your faith or performing religious rituals, you can roll+Wis to gain divine insight or guidance. On a 10+, you gain useful information or a blessing. On a 7-9, you gain some information or a minor boon, but also expose yourself to temptation or danger</li></ul>"
    },
    {
        "name": "Farmer",
        "crystals": {
            "requires": [],
            "provides": ["ranger"]
        },
        "stats": {
            "hp": 10,
            "mp": 2,
            "sp": 8,
            "hd": "1d10",
            "md":"1d4",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>You are a farmer, skilled in working the land to grow crops and raise livestock. You have the following abilities:</p><ul><li>You have knowledge of agriculture and can identify useful plants or animals</li><li>You are able to repair simple tools and equipment, such as plows or fences</li><li>If you spend time tending to your fields or livestock, you can roll+Wis to gain insight or productivity. On a 10+, you gain useful information or a bountiful harvest. On a 7-9, you gain some information or a minor boon, but also face a setback or complication</li></ul>"
    },
    {
        "name": "Fisherman",
        "crystals": {
            "requires": [],
            "provides": ["druid"]
        },
        "stats": {
            "hp": 8,
            "mp": 2,
            "sp": 10,
            "hd": "1d8",
            "md":"1d4",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>You are a fisherman, skilled in catching and preparing fish for consumption. You have the following abilities:</p><ul><li>You have knowledge of local fishing spots and techniques, and can identify useful bait or tackle</li><li>You are able to repair or maintain small boats or fishing gear</li><li>If you spend time fishing or studying the sea, you can roll+Wis to gain insight or a catch. On a 10+, you gain useful information or a bountiful catch. On a 7-9, you gain some information or a minor boon, but also face a hazard or setback</li></ul>"
    },
    {
        "name": "Minstrel",
        "crystals": {
            "requires": [],
            "provides": ["bard"]
        },
        "stats": {
            "hp": 6,
            "mp": 8,
            "sp": 6,
            "hd": "1d6",
            "md":"1d6",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>You are a minstrel, skilled in performing music and storytelling for entertainment. You have the following abilities:</p><ul><li>You have knowledge of various musical instruments and styles, and can identify their cultural or historical significance</li><li>You are able to compose or improvise songs or poems on a variety of topics</li><li>If you spend time performing or studying the arts, you can roll+Cha to gain inspiration or insight. On a 10+, you gain useful information or a favorable audience. On a 7-9, you gain some information or attention, but also offend or alienate someone in the process</li></ul>"
    },
    {
        "name": "Acrobat",
        "crystals": {
            "requires": [],
            "provides": ["rogue"]
        },
        "stats": {
            "hp": 6,
            "mp": 0,
            "sp": 10,
            "hd": "1d6",
            "md":"1d4",
            "sd": "1d8"
        },
        "type": "character",
        "description": "<p>As an acrobat, you are skilled in performing acrobatic feats and balancing acts. You gain the following abilities:</p><ul><li>You gain +1 forward when using the Balance or Tumble moves</li><li>You have knowledge of various acrobatic techniques and can identify their origins or influences</li><li>If you spend time practicing your acrobatics or meditation, you can roll+Dex to gain insights and inspiration. On a 10+, you gain useful information. On a 7-9, you gain some information but also expose yourself to a distracting or dangerous situation</li></ul>"
    },
    {
        "name": "Monk",
        "crystals": {
            "requires": [],
            "provides": ["paladin"]
        },
        "stats": {
            "hp": 8,
            "mp": 4,
            "sp": 6,
            "hd": "1d8+1",
            "md":"1d4",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>As a monk, you are trained in the martial arts and spiritual discipline. You gain the following abilities:</p><ul><li>You gain +1 forward to your Attack or Defend moves when unarmed</li><li>You have knowledge of various religious and philosophical teachings, and can identify their applications or relevance</li><li>If you spend time practicing your meditation or exercise, you can roll+Wis to gain focus or clarity. On a 10+, you gain useful insights or a spiritual awakening. On a 7-9, you gain some insights or inspiration, but also expose yourself to temptation or doubt</li></ul>"
    },
    {
        "name": "Merchant",
        "crystals": {
            "requires": [],
            "provides": ["rogue"]
        },
        "stats": {
            "hp": 6,
            "mp": 0,
            "sp": 10,
            "hd": "1d6",
            "md":"1d4",
            "sd": "1d8"
        },
        "type": "character",
        "description": "<p>As a merchant, you are skilled in trading goods and negotiating deals. You gain the following abilities:</p><ul><li>You gain +1 forward when using the Haggle or Appraise moves</li><li>You have knowledge of various products and their values, and can identify profitable opportunities or risks</li><li>If you spend time studying markets or building networks, you can roll+Int to gain insights or contacts. On a 10+, you gain useful information or an advantageous connection. On a 7-9, you gain some information or a lead, but also attract competition or suspicion</li></ul>"
    },
    {
        "name": "Thief",
        "crystals": {
            "requires": [],
            "provides": ["rogue"]
        },
        "stats": {
            "hp": 6,
            "mp": 0,
            "sp": 10,
            "hd": "1d6",
            "md":"1d6",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>As a thief, you are skilled in stealing and infiltrating secure locations. You gain the following abilities:</p><ul><li>You gain +1 forward when using the Pick Pockets or Sneak moves</li><li>You have knowledge of various security measures and can bypass or disable them with the right tools or tactics</li><li>If you spend time casing a location or studying a mark, you can roll+Dex to gain insights or opportunities. On a 10+, you gain useful information or a valuable asset. On a 7-9, you gain some information or a lesser reward, but also face a complication or danger</li></ul>"
    },
    {
        "name": "Artisan",
        "crystals": {
            "requires": [],
            "provides": ["wizard"]
        },
        "stats": {
            "hp": 6,
            "mp": 8,
            "sp": 6,
            "hd": "1d6",
            "md":"1d8",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>As an artisan, you are skilled in creating art and crafting objects. You gain the following abilities:</p><ul><li>You gain +1 forward when using the Create or Repair moves</li><li>You have knowledge of various materials and techniques, and can identify their strengths or weaknesses</li><li>If you spend time working on a project, you can roll+Int to gain insights or inspiration. On a 10+, you gain useful information or a masterpiece. On a 7-9, you gain some information or a decent result, but also face a setback or compromise</li></ul>"
    },
    {
        "name": "Nurse",
        "crystals": {
            "requires": [],
            "provides": ["priest"]
        },
        "stats": {
            "hp": 4,
            "mp": 10,
            "sp": 6,
            "hd": "1d4+1",
            "md":"1d6",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>As a nurse, you are skilled in healing and caring for the sick and injured. You gain the following abilities:</p><ul><li>You gain +1 forward to your Heal or Soothe moves when treating wounds or illnesses</li><li>You have knowledge of various remedies and medical practices, and can identify their effects or potential hazards</li><li>If you spend time studying or researching medical topics, you can roll+Wis to gain insights or breakthroughs. On a 10+, you gain useful information or a cure. On a 7-9, you gain some information or a treatment, but also expose yourself to an infectious disease or risk</li></ul>"
    },
    {
        "name": "Hermit",
        "crystals": {
            "requires": [],
            "provides": ["druid"]
        },
        "stats": {
            "hp": 8,
            "mp": 8,
            "sp": 4,
            "hd": "1d8",
            "md":"1d4",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>As a hermit, you are isolated from society and devoted to nature and solitude. You gain the following abilities:</p><ul><li>You gain +1 forward to your Wis-based moves when communing with nature or meditating</li><li>You have knowledge of various natural phenomena and can predict or interpret their patterns</li><li>If you spend time exploring the wilderness or observing wildlife, you can roll+Wis to gain insights or revelations. On a 10+, you gain useful information or a vision. On a 7-9, you gain some information or an omen, but also expose yourself to a danger or discomfort</li></ul>"
    },
    {
        "name": "Pilgrim",
        "crystals": {
            "requires": [],
            "provides": ["paladin"]
        },
        "stats": {
            "hp": 6,
            "mp": 6,
            "sp": 8,
            "hd": "1d6+1",
            "md":"1d4",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>As a pilgrim, you are on a spiritual journey to a holy destination or to seek enlightenment. You gain the following abilities:</p><ul><li>You gain +1 forward to your Wisdom-based moves when dealing with matters of faith or morality</li><li>You have knowledge of various religious or mystical practices, and can identify their effects or purposes</li><li>If you spend time practicing your rituals or meditation, you can roll+Wis to gain insight or inspiration. On a 10+, you gain useful information or a spiritual blessing. On a 7-9, you gain some information or a minor boon, but also expose yourself to temptation or distraction</li></ul>"
    },
    {
        "name": "Sailor",
        "crystals": {
            "requires": [],
            "provides": ["ranger"]
        },
        "stats": {
            "hp": 8,
            "mp": 2,
            "sp": 8,
            "hd": "1d8",
            "md":"1d4",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>As a sailor, you are skilled in navigating the seas and handling ships. You gain the following abilities:</p><ul><li>You gain +1 forward when using the Navigate or Sail moves</li><li>You have knowledge of various nautical terms and practices, and can identify their meanings or origins</li><li>If you spend time studying the sea or practicing your knots, you can roll+Wis to gain insights or proficiency. On a 10+, you gain useful information or a favorable wind. On a 7-9, you gain some information or a fair current, but also face a hazard or delay</li></ul>"
    },
    {
        "name": "Baker",
        "crystals": {
            "requires": [],
            "provides": ["rogue"]
        },
        "stats": {
            "hp": 6,
            "mp": 2,
            "sp": 8,
            "hd": "1d6",
            "md":"1d4",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>You are a baker, skilled in creating delicious breads and pastries. You have the following abilities:</p><ul><li>You have knowledge of different types of flour, yeast, and baking techniques, and can identify high-quality ingredients</li><li>You are able to create edible treats that can serve as distractions or bribes</li><li>If you spend time baking or studying recipes, you can roll+Wis to gain new knowledge or inspiration. On a 10+, you gain useful information or a successful batch. On a 7-9, you gain some information, but also face a setback or complication</li></ul>"
    },
    {
        "name": "Enchanter",
        "crystals": {
            "requires": [],
            "provides": ["wizard"]
        },
        "stats": {
            "hp": 6,
            "mp": 10,
            "sp": 6,
            "hd": "1d4",
            "md":"1d8",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>You are an enchanter, skilled in imbuing objects with magical properties. You have the following abilities:</p><ul><li>You have knowledge of the various schools of magic, and can identify runes or sigils</li><li>You are able to examine magical items and determine their properties or origins</li><li>If you spend time enchanting an item, you can roll+Int to imbue it with a particular property or effect. On a 10+, the enchantment is successful and powerful. On a 7-9, the enchantment is weaker than intended, or comes with an unintended side-effect. On a miss, the enchantment fails and the materials are lost</li></ul>"
    },
    {
        "name": "Herbalist",
        "crystals": {
            "requires": [],
            "provides": ["druid"]
        },
        "stats": {
            "hp": 6,
            "mp": 8,
            "sp": 6,
            "hd": "1d4",
            "md":"1d6",
            "sd": "1d8"
        },
        "type": "character",
        "description": "<p>You are a herbalist, skilled in identifying and using plants for medicinal or magical purposes. You have the following abilities:</p><ul><li>You have knowledge of various herbs, flowers, and mushrooms, and can identify their properties and uses</li><li>You are able to create potions or poultices that can heal or enhance various attributes</li><li>If you spend time gathering or studying plants, you can roll+Wis to gain new knowledge or ingredients. On a 10+, you gain useful information or a powerful ingredient. On a 7-9, you gain some information or an ingredient, but also face a danger or obstacle</li></ul>"
    },
    {
        "name": "Healer",
        "crystals": {
            "requires": [],
            "provides": ["priest"]
        },
        "stats": {
            "hp": 6,
            "mp": 8,
            "sp": 6,
            "hd": "1d6",
            "md":"1d6",
            "sd": "1d6"
        },
        "type": "character",
        "description": "<p>You are a healer, skilled in tending to injured or sick individuals. You have the following abilities:</p><ul><li>You have knowledge of anatomy and medicine, and can identify various ailments and their treatments</li><li>You are able to heal injuries or diseases, either through natural remedies or divine magic</li><li>If you spend time studying or practicing healing, you can roll+Wis to gain new knowledge or insight. On a 10+, you heal a patient or gain useful information. On a 7-9, you heal a patient or gain information, but also expose yourself to danger or complications</li></ul>"
    },
    {
        "name": "Artisan",
        "crystals": {
            "requires": [],
            "provides": ["bard"]
        },
        "stats": {
            "hp": 6,
            "mp": 6,
            "sp": 8,
            "hd": "1d6",
            "md":"1d8",
            "sd": "1d4"
        },
        "type": "character",
        "description": "<p>You are an artisan, skilled in various forms of artistic expression. You have the following abilities:</p><ul><li>You have knowledge of different styles and genres of art, and can identify high-quality works</li><li>You are able to create works of art that can inspire or influence others</li><li>If you spend time creating or studying art, you can roll+Cha to gain new knowledge or inspiration. On a 10+, you create a masterpiece or gain useful information. On a 7-9, you create a work of art or gain information, but also face a setback or limitation</li></ul>"
    },{
        "name": "Shield Wall",
        "crystals": {
            "provided": [
                "fighter"
            ],
            "required": []
        },
        "type": "ability",
        "cost": "6 months",
        "price": 1000,
        "description": "You and your allies can create a shield wall, protecting yourselves from enemy attacks. When you and at least one other ally wielding a shield are adjacent to each other in a tight formation, you may use a defend action that affects all of you. You and your adjacent allies gain +1 armor against all attacks for the duration of the defend action. Additionally, when you successfully defend against an enemy's attack with your shield, you may mark experience."
    },
    {
        "name": "Elemental Magic",
        "crystals": {
            "provided": [],
            "required": [
                "wizard"
            ]
        },
        "type": "feature",
        "cost": "8 months",
        "price": 1500,
        "description": "Your mastery of the arcane allows you to control the elements themselves. When you cast a spell related to fire, water, earth, or air, you may roll+Int instead of +Wis. On a 10+, you cast the spell successfully without any complications. On a 7-9, the spell has unintended consequences or side effects. On a miss, the spell backfires, causing harm to you or your allies."
    },
    {
        "name": "Taming Magic",
        "crystals": {
            "provided": [],
            "required": [
                "druid"
            ]
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "Your connection to nature extends to the creatures that inhabit it, and you can use your magic to calm or tame beasts. When you encounter a hostile animal, you may attempt to calm it with a spell. Roll+Wis. On a 10+, the animal becomes docile and will not attack you or your allies unless provoked. On a 7-9, the animal is hesitant, and may require further convincing or calming. On a miss, the animal becomes enraged and will attack you or your allies."
    },
    {
        "name": "Battle Cry",
        "crystals": {
            "provides": [],
            "requires": [
                "barbarian"
            ]
        },
        "type": "ability",
        "cost": "3 months",
        "price": 500,
        "description": "You can unleash a battle cry, inspiring yourself and your allies to fight harder. When you charge into battle, you may spend 1 stamina to let out a mighty roar. Roll+Con. On a 10+, you and your allies gain +1 forward to all rolls for the duration of the fight. On a 7-9, you gain the bonus, but at a cost. On a miss, your roar is ineffective, and your allies suffer -1 ongoing to all rolls for the duration of the fight."
    },
    {
        "name": "Improved Healing",
        "crystals": {
            "provides": [
            ],
            "requires": ["priest"]
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "Your healing abilities have improved, allowing you to restore more health to your allies. When you use your Healing Touch ability, you may spend an additional 1d4+1 charges to restore an extra 1d8+Wis HP to the target. Additionally, when you successfully heal a creature above its maximum HP, the excess healing is converted into temporary hit points for the target, which last until the end of the next combat encounter."
    },
    {
        "name": "Explosive Arrow",
        "crystals": {
            "provided": [],
            "required": [
                "ranger"
            ]
        },
        "type": "ability",
        "cost": "3 months",
        "price": 500,
        "description": "You can attach an explosive charge to one of your arrows, creating a deadly projectile. When you use a ranged attack with a bow, you may spend 1 stamina to attach an explosive charge to the arrow. Roll+Dex. On a hit, the arrow deals its regular damage, plus an additional 1d6 damage to all creatures within a nearby area. On a miss, the charge detonates prematurely, causing harm to you or your allies."
    },
    {
        "name": "Combat Expertise",
        "crystals": {
            "provided": [],
            "required": [
                "fighter",
                "barbarian"
            ]
        },
        "type": "feature",
        "cost": "4 months",
        "price": 800,
        "description": "You have extensive training in combat and can read your opponent's moves, gaining an advantage in battle. When you discern realities or spout lore related to combat, you may roll+WIS or +INT instead of +WIS. On a 10+, you ask the GM three questions from the list below. On a 7-9, ask one:<ul><li>What can I do to gain the upper hand in this fight?</li><li>What is my opponent's weakness?</li><li>What is my opponent planning to do next?</li><li>What is my best course of action in this situation?</li><li>How can I avoid taking damage in this fight?</li></ul>On a miss, your opponent takes advantage of your distraction and gains the upper hand in the fight."
    },
    {
        "name": "Rage",
        "crystals": {
            "provided": [],
            "required": [
                "barbarian"
            ]
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "You tap into the primal power within you, entering a state of uncontrollable rage. When you enter a rage, you gain +2 damage and +2 armor piercing for the duration of the rage, but suffer -1 ongoing to any actions that require calm or measured thought. The rage lasts for a number of rounds equal to your CON score, after which you must rest for at least an hour before entering another rage. While raging, you cannot control your actions, and will attack the nearest target, friend or foe."
    },
    {
        "name": "Wilderness Survival",
        "crystals": {
            "provided": [],
            "required": [
                "ranger",
                "druid"
            ]
        },
        "type": "feature",
        "cost": "4 months",
        "price": 700,
        "description": "You have extensive training in surviving in the wilderness, and can find food and shelter even in the harshest environments. When you make a move related to survival in the wilderness, you may roll+WIS or +INT instead of +WIS. On a 10+, you find what you need to survive without any trouble. On a 7-9, you face a complication, but still manage to find what you need. On a miss, you fail to find what you need and suffer -1 ongoing to all moves related to survival in the wilderness until you receive help or rest for at least a day."
    },
    {
        "name": "Sneak Attack",
        "crystals": {
            "provided": [],
            "required": [
                "rogue"
            ]
        },
        "type": "feature",
        "cost": "4 months",
        "price": 800,
        "description": "You specialize in surprise attacks and are skilled at striking from the shadows. When you make a move to attack an unsuspecting target, you deal an extra 1d6 damage if you hit. You can only use this feature once per target per combat. On a miss, you reveal your position and the target gains the advantage in the fight."
    },
    {
        "name": "Nature Magic",
        "crystals": {
            "provided": [],
            "required": [
                "druid"
            ]
        },
        "type": "feature",
        "cost": "8 months",
        "price": 1500,
        "description": "You have a deep connection to the natural world and can draw on its power to cast spells. When you cast a spell related to nature, you may roll+WIS or +INT instead of +WIS. On a 10+, you cast the spell successfully without any consequences. On a 7-9, the spell has unintended consequences or side effects. On a miss, the spell backfires, causing harm to you or your allies."
    },
    {
        "name": "Divine Intervention",
        "crystals": {
            "provided": [],
            "required": [
                "cleric"
            ]
        },
        "type": "feature",
        "cost": "12 months",
        "price": 3000,
        "description": "You have been granted divine power by your deity, and can call upon them to intervene in times of need. When you suffer harm or face a difficult situation, you may pray to your deity for aid. Roll+CHA. On a 10+, your deity intervenes, providing you with aid or guidance. On a 7-9, the aid is granted, but at a cost. On a miss, your deity is displeased and may revoke your powers or send an enemy to punish you."
    },
    {
        "name": "Arcane Mastery",
        "crystals": {
            "provided": [],
            "required": [
                "wizard"
            ]
        },
        "type": "feature",
        "cost": "12 months",
        "price": 3000,
        "description": "You have reached the pinnacle of arcane knowledge and can bend the forces of magic to your will. When you cast a spell, you may roll+INT. On a 10+, the spell is cast without any complications or side effects. On a 7-9, the spell has unintended consequences or side effects. On a miss, the spell backfires, causing harm to you or your allies."
    },
    {
        "name": "Inspiring Performance",
        "crystals": {
            "provided": [],
            "required": [
                "bard"
            ]
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "You have a powerful voice and can rally your allies to fight on, even in the face of overwhelming odds. When you perform for your allies, roll+CHA. On a 10+, your allies gain +1 forward to all rolls for the duration of the fight. On a 7-9, your allies gain the bonus, but at a cost. On a miss, your performance falls flat and your allies suffer -1 ongoing to all rolls for the duration of the fight."
    },
    {
        "name": "Weapon Training",
        "crystals": {
            "provided": [],
            "required": []
        },
        "type": "feature",
        "cost": "3 months",
        "price": 500,
        "description": "You have trained extensively in the use of a specific type of weapon. Choose one type of weapon (e.g. swords, bows, axes, etc.) and gain +1 ongoing when using that weapon in combat. You also gain access to a special move related to that weapon, which you may use once per combat encounter. The specific move depends on the weapon type chosen."
    },
    {
        "name": "Stealth Training",
        "crystals": {
            "provided": [],
            "required": []
        },
        "type": "feature",
        "cost": "3 months",
        "price": 500,
        "description": "You have honed your skills in the art of stealth. You gain +1 ongoing when attempting to move silently, hide or avoid detection, and pick locks or disarm traps. Additionally, when you successfully make a stealthy approach or escape, you may mark experience."
    },
    {
        "name": "Healing Touch",
        "crystals": {
            "provided": [],
            "required": [
                "cleric"
            ]
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "You possess the divine gift of healing. When you lay your hands upon a wounded creature, you may spend 1d4+1 charges to restore 1d8+Wis HP to them. You start with 4 charges, and gain an additional charge per level. Additionally, when you successfully heal a creature, you may mark experience."
    },
    {
        "name": "Shadow Step",
        "crystals": {
            "provided": [],
            "required": [
                "rogue"
            ]
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "You can move through shadows like they were solid objects. When you are in dim light or darkness, you may spend 1 stamina to teleport to any other location within the same area of shadows. You must have line of sight to the location you are teleporting to. Additionally, when you successfully ambush or sneak past a creature, you may mark experience."
    },
    {
        "name": "Divine Fury",
        "crystals": {
            "provided": [
                "cleric"
            ],
            "required": []
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "You can call upon the divine to smite your enemies. When you deal damage to a creature with a melee attack, you may spend 1 charge to deal an additional 1d6 damage of the same type as your weapon (e.g. radiant, necrotic, etc.). Additionally, when you defeat a creature that posed a significant threat to your allies or your faith, you may mark experience."
    },
    {
        "name": "Sneak Attack",
        "crystals": {
            "provided": [
                "rogue"
            ],
            "required": []
        },
        "type": "ability",
        "cost": "3 months",
        "price": 500,
        "description": "You can strike from the shadows with deadly precision. When you attack an enemy who hasn't detected you or is otherwise vulnerable, deal an additional 1d6 damage on a hit."
    },
    {
        "name": "Divine Favor",
        "crystals": {
            "provided": [
                "cleric"
            ],
            "required": []
        },
        "type": "ability",
        "cost": "6 months",
        "price": 1000,
        "description": "You call upon your deity to aid you in battle. Once per combat, you may ask your deity for a specific blessing. Roll+Wis. On a 10+, your deity grants you exactly what you asked for. On a 7-9, your deity grants you the blessing, but also demands some sort of sacrifice or service in return. On a miss, your deity is not pleased with your request, and may inflict some sort of punishment or curse."
    },
    {
        "name": "Shield Bash",
        "crystals": {
            "provided": [
                "fighter"
            ],
            "required": []
        },
        "type": "ability",
        "cost": "3 months",
        "price": 500,
        "description": "You can use your shield as an offensive weapon, bashing enemies with surprising force. When you successfully defend against an enemy's attack with your shield, you may immediately follow up with a shield bash. Roll+Str. On a hit, deal your shield's damage and stun the enemy for a moment."
    },
    {
        "name": "Animal Companion",
        "crystals": {
            "provided": [
                "druid"
            ],
            "required": []
        },
        "type": "ability",
        "cost": "6 months",
        "price": 1000,
        "description": "You have a special connection with the natural world, and can call upon an animal companion to aid you. Choose a type of animal and describe it. When you spend time among nature, you may attempt to tame an animal of that type. Roll+Wis. On a 10+, the animal becomes your loyal companion. On a 7-9, the animal is hesitant, and may require further convincing or training. On a miss, the animal is offended or frightened, and may attack or flee."
    },
    {
        "name": "Arcane Training",
        "crystals": {
            "requires": [],
            "provides": [
                "wizard"
            ]
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "You have extensive training in the arcane arts, and can draw upon your knowledge to gain insight into magical phenomena. When you encounter a magical effect or creature, you may roll+Int. On a 10+, you understand the nature and origin of the magic, and gain +1 forward to discern realities or spout lore related to it. On a 7-9, you have some knowledge of the magic, but it is incomplete or outdated, and you only gain +1 forward if you act on the information immediately. On a miss, the magic overwhelms you, and you suffer -1 ongoing to all rolls related to magic until you receive a moment of rest or a counteracting spell."
    },
    {
        "name": "Pyromancy",
        "crystals": {
            "requires": [
                "wizard"
            ],
            "provides": []
        },
        "type": "feature",
        "cost": "6 months",
        "price": 1000,
        "description": "<p><p>When you call upon the power of fire to achieve your goals, roll+Cha. On a 10+, choose three from the list below. On a 7-9, choose two:</p><ul><li>You create an explosion, dealing damage to all creatures in the area</li><li>You shape flames to your will, directing them to move or change shape as you desire</li><li>You ignite a nearby object or surface, causing it to burst into flames</li><li>You intimidate or frighten others with displays of fiery power</li><li>You protect yourself from fire and heat</li></ul><p>On a miss, the fire you call upon burns out of control, causing harm to yourself or your allies.</p></p> "
    },
    {
        "name": "Mountain Dwarf",
        "crystals": {
            "requires": [],
            "provides": [
                "soldier"
            ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Mountain-Born.</h3><p>You are acclimated to high altitudes and cold climates. You take no penalties for elevation and are able to keep warm in cold environments without extra gear.</p><h3>Unyielding.</h3><p>When you take damage and would be knocked prone, you may instead remain standing and take +1 forward to your next attack.</p><h3>Stonework.</h3><p>When you discern realities or spout lore about stonework, take +1 to your roll. When you defy danger in a stonework environment, you may take +1 forward to your roll.</p></p>"
    }
    ,
    {
        "name": "Human",
        "crystals": {
            "requires": [],
            "provides": []
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Versatile.</h3><p>Humans have no particular strengths or weaknesses, making them versatile and adaptable to any situation. You gain +1 to any non-combat checks that have not been mentioned by another racial trait.</p></p>"
    },
    {
        "name": "High Elf",
        "crystals": {
            "requires": [],
            "provides": [ "wizard" ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Elven Grace.</h3><p>You are lithe and graceful, giving you +1 to defy danger using DEX or CHA. You also take no damage from falls.</p><h3>Magical Insight.</h3><p>You have a natural affinity for magic. When you spout lore or discern realities about arcane magic, take +1 to your roll.</p></p>"
    },
    {
        "name": "Wood Elf",
        "crystals": {
            "requires": [],
            "provides": [ "ranger" ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Woodland Stride.</h3><p>You are at home in the wilderness, giving you +1 to defy danger in forested or overgrown areas. You also always know the quickest route through such terrain.</p><h3>Keen Vision.</h3><p>Your eyes are sharp, giving you +1 to volley and discern realities using WIS when dealing with distant or obscured targets.</p></p>"
    },
    {
        "name": "Hill Dwarf",
        "crystals": {
            "requires": [],
            "provides": [ "priest" ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Toughness.</h3><p>Your body is hardy, giving you +1 armor. You also take +1 to any roll that involves resisting being moved or knocked down.</p><h3>Artisanal Expertise.</h3><p>You have a deep understanding of stonework and metalworking. When you spout lore or discern realities about artisanal crafts or items, take +1 to your roll.</p></p>"
    },
    {
        "name": "Halfling",
        "crystals": {
            "requires": [],
            "provides": [ "rogue" ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Luck.</h3><p>You have an uncanny knack for avoiding harm. Whenever you defy danger by rolling a 6-, treat it as a 7-9 instead. If you already rolled a 7-9, you get to ask the GM one additional question from discern realities.</p><h3>Cleverness.</h3><p>You are quick on your feet and skilled at getting out of tight spots. When you help or interfere with someone using DEX, you take +1 forward to your roll. You also take no penalty when disarming or bypassing traps using DEX.</p></p>"
    },
    {
        "name": "Tinker Gnome",
        "crystals": {
            "requires": [],
            "provides": [ "soldier" ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Mechanical Aptitude.</h3><p>You have a natural understanding of mechanical devices. When you spout lore or discern realities about a mechanical device or contraption, take +1 to your roll.</p><h3>Artificer's Eye.</h3><p>You notice details that others often miss. When you closely examine a mechanical or magical device and describe its function, the GM will give you more information than usual, including any potential flaws or weaknesses.</p></p>"
    },
    {
        "name": "Sylvan Gnome",
        "crystals": {
            "requires": [],
            "provides": [ "druid" ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Sylvan Magic.</h3><p>You have a connection to the natural world, making you immune to disease and poison from natural sources. You may also spout lore about the natural world or cast spells related to plants and animals as if you were a wizard of one level lower.</p><h3>Silent Stride.</h3><p>You move stealthily through the wilderness, giving you +1 to defy danger using DEX or WIS when avoiding detection in a natural setting.</p></p>"
    },
    {
        "name": "Dark Elf",
        "crystals": {
            "requires": [],
            "provides": [ "rogue" ]
        },
        "type": "feature",
        "cost": "Being born one",
        "price": "",
        "description": "<p><p><h3>Drow Magic.</h3><p>You have access to the dark magic of the Underworld. You may spout lore about the Underworld or cast spells related to shadows and darkness as if you were a wizard of one level lower.</p><h3>Keen Senses.</h3><p>Your senses are sharp and attuned to danger. You take +1 to discern realities when dealing with traps, ambushes, or other hidden dangers.</p></p>"
    },
    {
        "name": "Tiefling",
        "crystals": {
            "requires": [],
            "provides": [ "wizard" ]
        },
        "type": "feature",
        "cost": "Having a demon ancestor",
        "price": "1d6 sanity damage",
        "description": "<p><p><h3>Infernal Powers.</h3><p>You have access to the dark powers of your demon ancestors. You may spout lore about demons or cast spells related to fire and darkness as if you were a wizard of one level lower.</p><h3>Demonic Resistance.</h3><p>Your infernal blood gives you resistance to fire and immunity to possession by lesser demons. However, you take double damage from holy sources.</p></p>"
    },
    {
        "name": "Half-Orc",
        "crystals": {
            "requires": [],
            "provides": [ "barbarian" ]
        },
        "type": "feature",
        "cost": "Being born half-orc",
        "price": "",
        "description": "<p><p><h5>Orcish Fury.</h5><p>You are prone to sudden fits of violent rage. When you charge into battle or take damage, you may enter a berserker rage, gaining +1 damage and +1 armor until the end of the battle. However, you cannot choose your targets and may attack allies if they are in your path.</p><h3>Brutish Strength.</h3><p>Your orcish heritage gives you incredible strength. When you hack and slash using STR, you deal +1 damage.</p></p>"
    },
    {
        "name": "Goblin",
        "crystals": {
            "requires": [],
            "provides": [ "rogue" ]
        },
        "type": "feature",
        "cost": "Being born a goblin",
        "price": "",
        "description": "<p><p><h3>Goblin Cunning.</h3><p>Goblins are survivors, always able to find a way out of a tight spot. When you defy danger using DEX, you take +1 to your roll. You also take +1 forward to any move that involves subterfuge or deception.</p><h3>Small and Wary.</h3><p>You are small and difficult to hit. You gain +1 armor against attacks by enemies larger than you, and you take +1 to defy danger using DEX when avoiding physical attacks.</p></p>"
    },[{ "name": "Longsword", "crystals": { "requires" :["soldier" ], "provides": [] }, "type": "item", "weight": "2 kg", "price": "30 coins", "description": "<p><h3>Swordsman:</h3> <p>When you attack with a longsword, roll +Dex. On a 7-9, you deal damage. On a 10+, you deal damage and choose one additional effect from the list below. On a 12+, you can choose two effects.</p> <ul><li>Your attack inflicts a grievous wound, causing your target to take -1 ongoing to all rolls until they receive healing or medical attention</li><li>Your attack creates an opening, giving you or an ally +1 forward to their next attack against the target</li><li>Your attack stuns or knocks down your target, giving you or an ally an opportunity to quicklyact before they can react</li></ul><h3>Defensive Parry:</h3><p>When you use a longsword to defend yourself, roll+Dex instead of +Con. On a 10+, you deflect theattack and take no damage. On a 7-9, you deflect the attack but suffer a -1 penalty to your nextattack roll.</p></p>" },

        { "name": "Crossbow", "crystals": { "requires" :["ranger" ], "provides": [] }, "type": "item", "weight": "3 kg", "price": "50 coins", "description": "<p><h3>Sharpshooter:</h3> <p>When you attack with a crossbow, roll +Dex. On a 7-9, you deal damage. On a 10+, you deal damage and choose one additional effect from the list below. On a 12+, you can choose two effects.</p> <ul><li>Your attack ignores armor or cover</li><li>Your attack deals +1d6 damage</li><li>Your attack pins your target to a nearby surface, preventing them from moving until they free themselves</li></ul><h3>Quick Reload:</h3><p>When you use a crossbow, you can reload it as part of your attack action instead of using a separate action.</p></p>" },
        { "name": "Leather Armor", "crystals": { "requires" :["rogue" ], "provides": [] }, "type": "item", "weight": "4 kg", "price": "20 coins", "description": "<p><h3>Sneaky:</h3> <p>When you wear leather armor, you have advantage on Stealth checks.</p><h3>Light:</h3><p>When you wear leather armor, it does not impose disadvantage on Dexterity (Acrobatics) checks.</p></p>" },
        { "name": "Sunrod", "crystals": { "requires" :[], "provides": [] }, "type": "item", "weight": "0.5 kg", "price": "2 coins", "description": "<p><h3>Bright Light:</h3> <p>A sunrod is a metal rod about 1 foot long that glows brightly when activated. To activate it, simply twist the rod’s end cap. A sunrod sheds bright light in a 30-foot radius and dim light for an additional 30 feet. It burns for 6 hours before going out.</p></p>" },
        { "name": "Healing Potion",
            "crystals": { "requires" :[] , "provides": []
            },
            "type":"item", "weight": "0.25 kg", "price": "50 coins", "description": "<p><h3>Restorative:</h3> <p>A healing potion is a vial of red liquid that heals wounds when consumed. As an action, you can drink a healing potion or administer it to another creature. The creature regains 2d4 + 2 hit points.</p></p>" }]
]




for (var card in jsonData) {

// Use an if statement to check the type value and render the appropriate card
    if (jsonData[card].type === "character") {
        var cardTemplate = document.querySelector("#character-card-template").innerHTML;
    } else if (jsonData[card].type === "item") {
        var cardTemplate = document.querySelector("#item-card-template").innerHTML;
    } else if (jsonData[card].type === "feature") {
        var cardTemplate = document.querySelector("#feature-card-template").innerHTML;
    }

// Use a template engine like Mustache.js to render the JSON data into the card template
    var renderedCard = mustache.render(cardTemplate, jsonData[card]);

    document.querySelector("#card-grid").innerHTML += renderedCard;

}

$(function() {
    $("#btnSave").click(function() {
        html2canvas($("#card-grid").then(
            )
        )
    });
});
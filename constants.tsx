
import { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    color: 'bg-orange-400',
    items: [
      { id: 'anim_lion', name: 'Lion', persianName: 'شیر', emoji: '🦁', color: 'orange' },
      { id: 'anim_elephant', name: 'Elephant', persianName: 'فیل', emoji: '🐘', color: 'gray' },
      { id: 'anim_giraffe', name: 'Giraffe', persianName: 'زرافه', emoji: '🦒', color: 'yellow' },
      { id: 'anim_monkey', name: 'Monkey', persianName: 'میمون', emoji: '🐒', color: 'brown' },
      { id: 'anim_tiger', name: 'Tiger', persianName: 'ببر', emoji: '🐯', color: 'orange' },
    ]
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    color: 'bg-red-400',
    items: [
      { id: 'frut_apple', name: 'Apple', persianName: 'سیب', emoji: '🍎', color: 'red' },
      { id: 'frut_banana', name: 'Banana', persianName: 'موز', emoji: '🍌', color: 'yellow' },
      { id: 'frut_grapes', name: 'Grapes', persianName: 'انگور', emoji: '🍇', color: 'purple' },
      { id: 'frut_strawberry', name: 'Strawberry', persianName: 'توت فرنگی', emoji: '🍓', color: 'red' },
      { id: 'frut_watermelon', name: 'Watermelon', persianName: 'هندوانه', emoji: '🍉', color: 'green' },
    ]
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: '🎨',
    color: 'bg-purple-400',
    items: [
      { id: 'col_red', name: 'Red', persianName: 'قرمز', emoji: '🔴', color: 'red' },
      { id: 'col_blue', name: 'Blue', persianName: 'آبی', emoji: '🔵', color: 'blue' },
      { id: 'col_yellow', name: 'Yellow', persianName: 'زرد', emoji: '🟡', color: 'yellow' },
      { id: 'col_green', name: 'Green', persianName: 'سبز', emoji: '🟢', color: 'green' },
      { id: 'col_orange', name: 'Orange', persianName: 'نارنجی', emoji: '🟠', color: 'orange' },
    ]
  },
  {
    id: 'numbers',
    name: 'Numbers',
    icon: '🔢',
    color: 'bg-blue-400',
    items: [
      { id: 'num_1', name: 'One', persianName: 'یک', emoji: '1️⃣', color: 'blue' },
      { id: 'num_2', name: 'Two', persianName: 'دو', emoji: '2️⃣', color: 'green' },
      { id: 'num_3', name: 'Three', persianName: 'سه', emoji: '3️⃣', color: 'red' },
      { id: 'num_4', name: 'Four', persianName: 'چهار', emoji: '4️⃣', color: 'yellow' },
      { id: 'num_5', name: 'Five', persianName: 'پنج', emoji: '5️⃣', color: 'purple' },
    ]
  },
  {
    id: 'shapes',
    name: 'Shapes',
    icon: '📐',
    color: 'bg-pink-400',
    items: [
      { id: 'shp_circle', name: 'Circle', persianName: 'دایره', emoji: '⭕', color: 'red' },
      { id: 'shp_square', name: 'Square', persianName: 'مربع', emoji: '⬜', color: 'gray' },
      { id: 'shp_triangle', name: 'Triangle', persianName: 'مثلث', emoji: '🔺', color: 'red' },
      { id: 'shp_star', name: 'Star', persianName: 'ستاره', emoji: '⭐', color: 'yellow' },
      { id: 'shp_heart', name: 'Heart', persianName: 'قلب', emoji: '❤️', color: 'red' },
    ]
  },
  { id: 'v', name: 'Vehicles', icon: '🚗', color: 'bg-yellow-500', items: [
      { id: 'veh_car', name: 'Car', persianName: 'ماشین', emoji: '🚗', color: 'red' },
      { id: 'veh_plane', name: 'Plane', persianName: 'هواپیما', emoji: '✈️', color: 'blue' },
      { id: 'veh_train', name: 'Train', persianName: 'قطار', emoji: '🚂', color: 'green' },
      { id: 'veh_bike', name: 'Bike', persianName: 'دوچرخه', emoji: '🚲', color: 'black' },
      { id: 'veh_boat', name: 'Boat', persianName: 'قایق', emoji: '🚢', color: 'white' },
    ]
  },
  { id: 'o', name: 'Ocean', icon: '🐳', color: 'bg-cyan-400', items: [
      { id: 'ocn_whale', name: 'Whale', persianName: 'نهنگ', emoji: '🐳', color: 'blue' },
      { id: 'ocn_shark', name: 'Shark', persianName: 'کوسه', emoji: '🦈', color: 'gray' },
      { id: 'ocn_crab', name: 'Crab', persianName: 'خرچنگ', emoji: '🦀', color: 'red' },
      { id: 'ocn_octopus', name: 'Octopus', persianName: 'هشت پا', emoji: '🐙', color: 'pink' },
      { id: 'ocn_fish', name: 'Fish', persianName: 'ماهی', emoji: '🐠', color: 'yellow' },
    ]
  },
  { id: 'b', name: 'Birds', icon: '🐦', color: 'bg-emerald-400', items: [
      { id: 'brd_parrot', name: 'Parrot', persianName: 'طوطی', emoji: '🦜', color: 'green' },
      { id: 'brd_owl', name: 'Owl', persianName: 'جغد', emoji: '🦉', color: 'brown' },
      { id: 'brd_eagle', name: 'Eagle', persianName: 'عقاب', emoji: '🦅', color: 'brown' },
      { id: 'brd_penguin', name: 'Penguin', persianName: 'پنگوئن', emoji: '🐧', color: 'black' },
      { id: 'brd_duck', name: 'Duck', persianName: 'اردک', emoji: '🦆', color: 'green' },
    ]
  },
  { id: 'w', name: 'Weather', icon: '🌈', color: 'bg-indigo-400', items: [
      { id: 'wth_sun', name: 'Sun', persianName: 'خورشید', emoji: '☀️', color: 'yellow' },
      { id: 'wth_cloud', name: 'Cloud', persianName: 'ابر', emoji: '☁️', color: 'gray' },
      { id: 'wth_rain', name: 'Rain', persianName: 'باران', emoji: '🌧️', color: 'blue' },
      { id: 'wth_snow', name: 'Snow', persianName: 'برف', emoji: '❄️', color: 'white' },
      { id: 'wth_thunder', name: 'Thunder', persianName: 'رعد و برق', emoji: '⚡', color: 'yellow' },
    ]
  },
  { id: 'bp', name: 'Body', icon: '🖐️', color: 'bg-amber-400', items: [
      { id: 'bdy_hand', name: 'Hand', persianName: 'دست', emoji: '🖐️', color: 'skin' },
      { id: 'bdy_foot', name: 'Foot', persianName: 'پا', emoji: '🦶', color: 'skin' },
      { id: 'bdy_eye', name: 'Eye', persianName: 'چشم', emoji: '👁️', color: 'white' },
      { id: 'bdy_nose', name: 'Nose', persianName: 'بینی', emoji: '👃', color: 'skin' },
      { id: 'bdy_mouth', name: 'Mouth', persianName: 'دهان', emoji: '👄', color: 'red' },
    ]
  },
  { id: 'cl', name: 'Clothes', icon: '👕', color: 'bg-violet-400', items: [
      { id: 'clt_shirt', name: 'Shirt', persianName: 'پیراهن', emoji: '👕', color: 'blue' },
      { id: 'clt_pants', name: 'Pants', persianName: 'شلوار', emoji: '👖', color: 'blue' },
      { id: 'clt_dress', name: 'Dress', persianName: 'لباس زنانه', emoji: '👗', color: 'cyan' },
      { id: 'clt_hat', name: 'Hat', persianName: 'کلاه', emoji: '👒', color: 'green' },
      { id: 'clt_shoes', name: 'Shoes', persianName: 'کفش', emoji: '👟', color: 'white' },
    ]
  },
  { id: 'f', name: 'Food', icon: '🍕', color: 'bg-rose-400', items: [
      { id: 'fod_pizza', name: 'Pizza', persianName: 'پیتزا', emoji: '🍕', color: 'yellow' },
      { id: 'fod_burger', name: 'Burger', persianName: 'همبرگر', emoji: '🍔', color: 'brown' },
      { id: 'fod_bread', name: 'Bread', persianName: 'نان', emoji: '🍞', color: 'brown' },
      { id: 'fod_egg', name: 'Egg', persianName: 'تخم مرغ', emoji: '🥚', color: 'white' },
      { id: 'fod_cookie', name: 'Cookie', persianName: 'کلوچه', emoji: '🍪', color: 'brown' },
    ]
  },
  { id: 'i', name: 'Insects', icon: '🦋', color: 'bg-lime-400', items: [
      { id: 'ins_bee', name: 'Bee', persianName: 'زنبور', emoji: '🐝', color: 'yellow' },
      { id: 'ins_butterfly', name: 'Butterfly', persianName: 'پروانه', emoji: '🦋', color: 'blue' },
      { id: 'ins_ant', name: 'Ant', persianName: 'مورچه', emoji: '🐜', color: 'black' },
      { id: 'ins_spider', name: 'Spider', persianName: 'عنکبوت', emoji: '🕷️', color: 'black' },
      { id: 'ins_ladybug', name: 'Ladybug', persianName: 'کفشدوزک', emoji: '🐞', color: 'red' },
    ]
  },
  { id: 'mi', name: 'Music', icon: '🎸', color: 'bg-teal-400', items: [
      { id: 'mus_guitar', name: 'Guitar', persianName: 'گیتار', emoji: '🎸', color: 'red' },
      { id: 'mus_piano', name: 'Piano', persianName: 'پیانو', emoji: '🎹', color: 'black' },
      { id: 'mus_drum', name: 'Drum', persianName: 'طبل', emoji: '🥁', color: 'red' },
      { id: 'mus_violin', name: 'Violin', persianName: 'ویولن', emoji: '🎻', color: 'brown' },
      { id: 'mus_trumpet', name: 'Trumpet', persianName: 'شیپور', emoji: '🎺', color: 'yellow' },
    ]
  },
  { id: 'j', name: 'Jobs', icon: '🧑‍🚒', color: 'bg-slate-400', items: [
      { id: 'job_doctor', name: 'Doctor', persianName: 'دکتر', emoji: '🧑‍⚕️', color: 'blue' },
      { id: 'job_pilot', name: 'Pilot', persianName: 'خلبان', emoji: '🧑‍✈️', color: 'blue' },
      { id: 'job_chef', name: 'Chef', persianName: 'آشپز', emoji: '🧑‍🍳', color: 'white' },
      { id: 'job_farmer', name: 'Farmer', persianName: 'کشاورز', emoji: '🧑‍🌾', color: 'green' },
      { id: 'job_teacher', name: 'Teacher', persianName: 'معلم', emoji: '🧑‍🏫', color: 'brown' },
    ]
  },
  { id: 'sp', name: 'Space', icon: '🚀', color: 'bg-blue-900', items: [
      { id: 'spa_planet', name: 'Planet', persianName: 'سیاره', emoji: '🪐', color: 'yellow' },
      { id: 'spa_rocket', name: 'Rocket', persianName: 'راکت', emoji: '🚀', color: 'red' },
      { id: 'spa_moon', name: 'Moon', persianName: 'ماه', emoji: '🌙', color: 'yellow' },
      { id: 'spa_star_obj', name: 'Star', persianName: 'ستاره', emoji: '⭐', color: 'yellow' },
      { id: 'spa_alien', name: 'Alien', persianName: 'فضایی', emoji: '👽', color: 'green' },
    ]
  },
  { id: 've', name: 'Veggie', icon: '🥦', color: 'bg-green-600', items: [
      { id: 'veg_carrot', name: 'Carrot', persianName: 'هویج', emoji: '🥕', color: 'orange' },
      { id: 'veg_corn', name: 'Corn', persianName: 'ذرت', emoji: '🌽', color: 'yellow' },
      { id: 'veg_broccoli', name: 'Broccoli', persianName: 'کلم بروکلی', emoji: '🥦', color: 'green' },
      { id: 'veg_tomato', name: 'Tomato', persianName: 'گوجه فرنگی', emoji: '🍅', color: 'red' },
      { id: 'veg_potato', name: 'Potato', persianName: 'سیب زمینی', emoji: '🥔', color: 'brown' },
    ]
  },
  { id: 'na', name: 'Nature', icon: '🌳', color: 'bg-green-300', items: [
      { id: 'nat_tree', name: 'Tree', persianName: 'درخت', emoji: '🌳', color: 'green' },
      { id: 'nat_flower', name: 'Flower', persianName: 'گل', emoji: '🌸', color: 'pink' },
      { id: 'nat_mountain', name: 'Mountain', persianName: 'کوه', emoji: '⛰️', color: 'gray' },
      { id: 'nat_river', name: 'River', persianName: 'رودخانه', emoji: '🌊', color: 'blue' },
      { id: 'nat_leaf', name: 'Leaf', persianName: 'برگ', emoji: '🍃', color: 'green' },
    ]
  },
  { id: 'to', name: 'Toys', icon: '🧸', color: 'bg-orange-300', items: [
      { id: 'toy_teddy', name: 'Teddy', persianName: 'خرس عروسکی', emoji: '🧸', color: 'brown' },
      { id: 'toy_ball', name: 'Ball', persianName: 'توپ', emoji: '⚽', color: 'white' },
      { id: 'toy_doll', name: 'Doll', persianName: 'عروسک', emoji: '🪆', color: 'red' },
      { id: 'toy_robot', name: 'Robot', persianName: 'ربات', emoji: '🤖', color: 'gray' },
      { id: 'toy_yoyo', name: 'Yo-Yo', persianName: 'یویو', emoji: '🪀', color: 'green' },
    ]
  },
  { id: 'ho', name: 'House', icon: '🏠', color: 'bg-indigo-300', items: [
      { id: 'hou_bed', name: 'Bed', persianName: 'تخت', emoji: '🛏️', color: 'blue' },
      { id: 'hou_chair', name: 'Chair', persianName: 'صندلی', emoji: '🪑', color: 'brown' },
      { id: 'hou_table', name: 'Table', persianName: 'میز', emoji: '🪑', color: 'brown' },
      { id: 'hou_lamp', name: 'Lamp', persianName: 'لامپ', emoji: '💡', color: 'yellow' },
      { id: 'hou_sofa', name: 'Sofa', persianName: 'مبل', emoji: '🛋️', color: 'green' },
    ]
  },
  { id: 'sc', name: 'School', icon: '🎒', color: 'bg-sky-400', items: [
      { id: 'sch_book', name: 'Book', persianName: 'کتاب', emoji: '📖', color: 'blue' },
      { id: 'sch_pen', name: 'Pen', persianName: 'خودکار', emoji: '🖊️', color: 'black' },
      { id: 'sch_ruler', name: 'Ruler', persianName: 'خط کش', emoji: '📏', color: 'yellow' },
      { id: 'sch_bag', name: 'Bag', persianName: 'کیف', emoji: '🎒', color: 'red' },
      { id: 'sch_pencil', name: 'Pencil', persianName: 'مداد', emoji: '✏️', color: 'yellow' },
    ]
  },
  { id: 'em', name: 'Emoji', icon: '😀', color: 'bg-yellow-400', items: [
      { id: 'emo_happy', name: 'Happy', persianName: 'خوشحال', emoji: '😀', color: 'yellow' },
      { id: 'emo_sad', name: 'Sad', persianName: 'غمگین', emoji: '😢', color: 'yellow' },
      { id: 'emo_angry', name: 'Angry', persianName: 'عصبانی', emoji: '😠', color: 'red' },
      { id: 'emo_cool', name: 'Cool', persianName: 'باحال', emoji: '😎', color: 'black' },
      { id: 'emo_silly', name: 'Silly', persianName: 'دیوانه بازی', emoji: '🤪', color: 'yellow' },
    ]
  },
  { id: 'sr', name: 'Sport', icon: '🏀', color: 'bg-orange-600', items: [
      { id: 'spr_soccer', name: 'Soccer', persianName: 'فوتبال', emoji: '⚽', color: 'white' },
      { id: 'spr_tennis', name: 'Tennis', persianName: 'تنیس', emoji: '🎾', color: 'green' },
      { id: 'spr_golf', name: 'Golf', persianName: 'گلف', emoji: '⛳', color: 'green' },
      { id: 'spr_biking', name: 'Biking', persianName: 'دوچرخه سواری', emoji: '🚴', color: 'blue' },
      { id: 'spr_swimming', name: 'Swimming', persianName: 'شنا', emoji: '🏊', color: 'blue' },
    ]
  },
  { id: 'ft', name: 'Tools', icon: '🛠️', color: 'bg-zinc-400', items: [
      { id: 'tol_hammer', name: 'Hammer', persianName: 'چکش', emoji: '🔨', color: 'gray' },
      { id: 'tol_saw', name: 'Saw', persianName: 'اره', emoji: '🪚', color: 'gray' },
      { id: 'tol_wrench', name: 'Wrench', persianName: 'آچار', emoji: '🔧', color: 'blue' },
      { id: 'tol_axe', name: 'Axe', persianName: 'تبر', emoji: '🪓', color: 'brown' },
      { id: 'tol_drill', name: 'Drill', persianName: 'دریل', emoji: '🔩', color: 'gray' },
    ]
  },
  { id: 'dt', name: 'Drinks', icon: '🧃', color: 'bg-orange-200', items: [
      { id: 'drn_juice', name: 'Juice', persianName: 'آبمیوه', emoji: '🧃', color: 'orange' },
      { id: 'drn_milk', name: 'Milk', persianName: 'شیر', emoji: '🥛', color: 'white' },
      { id: 'drn_water', name: 'Water', persianName: 'آب', emoji: '💧', color: 'blue' },
      { id: 'drn_tea', name: 'Tea', persianName: 'چای', emoji: '🍵', color: 'green' },
      { id: 'drn_soda', name: 'Soda', persianName: 'نوشابه', emoji: '🥤', color: 'red' },
    ]
  }
];

var begin = false;
var s = "https://cantelope.org/NYE/";

function initVars() {
    pi = Math.PI;
    ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    playerZ = -25;
    playerX = playerY = playerVX = playerVY = playerVZ = pitch = yaw = pitchV = yawV = 0;
    scale = 600;
    seedTimer = 0;
    seedInterval = 5, seedLife = 100;
    gravity = .02;
    seeds = new Array();
    sparkPics = new Array();

    for (i = 1; i <= 10; ++i) {
        sparkPic = new Image();
        sparkPic.src = "./img/spark" + i + ".png";
        sparkPics.push(sparkPic);
    }
    sparks = new Array();
    frames = 0;
}

function showInfo() {
    begin = true;
    window.addEventListener("resize", () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        cx = canvas.width / 2;
        cy = canvas.height / 2;
    });

    pow1 = new Audio("./music/music1.mp3");
    pow2 = new Audio("./music/music2.mp3");
    pow3 = new Audio("./music/music3.mp3");
    pow4 = new Audio("./music/music4.mp3");
    pow1.load();
    pow2.load();
    pow3.load();
    pow4.load();


    initVars();
    frame();
    S.init();

    $('html, body').css({'background':'transparent', 'background-color':'black'});
    $('.copyright-box').html('');
    $('.top-box, .blessing-box, .music-box').remove();
    setTimeout("showText('context')", 25000);
    setTimeout("showText('give')", 25000);
    setTimeout("showBk()", 25000);
}

function showText(target) {
    switch (target) {
        case 'give':
            $('.copyright-box').text('赠你烟花雨');
            break;
        default :
            $('.'+target).css('display', 'block');
    }
}

function showBk () {
    $('html, body').css({'background-image':"url('./img/bk1.jpg')", '-moz-background-size':'100% 100%', 'background-size':'100% 100%'});
    $('.copyright-box').css({'color': 'white','letter-spacing':'15px','font-weight':'bold'});
}


function rasterizePoint(x, y, z) {

    var p, d;
    x -= playerX;
    y -= playerY;
    z -= playerZ;
    p = Math.atan2(x, z);
    d = Math.sqrt(x * x + z * z);
    x = Math.sin(p - yaw) * d;
    z = Math.cos(p - yaw) * d;
    p = Math.atan2(y, z);
    d = Math.sqrt(y * y + z * z);
    y = Math.sin(p - pitch) * d;
    z = Math.cos(p - pitch) * d;
    var rx1 = -1000, ry1 = 1, rx2 = 1000, ry2 = 1, rx3 = 0, ry3 = 0, rx4 = x, ry4 = z,
        uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
    if (!uc) return {x: 0, y: 0, d: -1};
    var ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
    var ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;
    if (!z) z = .000000001;
    if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
        return {
            x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
            y: cy + y / z * scale,
            d: Math.sqrt(x * x + y * y + z * z)
        };
    } else {
        return {
            x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
            y: cy + y / z * scale,
            d: -1
        };
    }
}

function spawnSeed() {

    seed = new Object();
    seed.x = -50 + Math.random() * 100;
    seed.y = 25;
    seed.z = -50 + Math.random() * 100;
    seed.vx = .1 - Math.random() * .2;
    seed.vy = -1.5;//*(1+Math.random()/2);
    seed.vz = .1 - Math.random() * .2;
    seed.born = frames;
    seeds.push(seed);
}

function splode(x, y, z) {

    t = 5 + parseInt(Math.random() * 150);
    sparkV = 1 + Math.random() * 2.5;
    type = parseInt(Math.random() * 3);
    switch (type) {
        case 0:
            pic1 = parseInt(Math.random() * 10);
            break;
        case 1:
            pic1 = parseInt(Math.random() * 10);
            do {
                pic2 = parseInt(Math.random() * 10);
            } while (pic2 == pic1);
            break;
        case 2:
            pic1 = parseInt(Math.random() * 10);
            do {
                pic2 = parseInt(Math.random() * 10);
            } while (pic2 == pic1);
            do {
                pic3 = parseInt(Math.random() * 10);
            } while (pic3 == pic1 || pic3 == pic2);
            break;
    }
    for (m = 1; m < t; ++m) {
        spark = new Object();
        spark.x = x;
        spark.y = y;
        spark.z = z;
        p1 = pi * 2 * Math.random();
        p2 = pi * Math.random();
        v = sparkV * (1 + Math.random() / 6)
        spark.vx = Math.sin(p1) * Math.sin(p2) * v;
        spark.vz = Math.cos(p1) * Math.sin(p2) * v;
        spark.vy = Math.cos(p2) * v;
        switch (type) {
            case 0:
                spark.img = sparkPics[pic1];
                break;
            case 1:
                spark.img = sparkPics[parseInt(Math.random() * 2) ? pic1 : pic2];
                break;
            case 2:
                switch (parseInt(Math.random() * 3)) {
                    case 0:
                        spark.img = sparkPics[pic1];
                        break;
                    case 1:
                        spark.img = sparkPics[pic2];
                        break;
                    case 2:
                        spark.img = sparkPics[pic3];
                        break;
                }
                break;
        }
        spark.radius = 25 + Math.random() * 50;
        spark.alpha = 1;
        spark.trail = new Array();
        sparks.push(spark);
    }
    switch (parseInt(Math.random() * 4)) {
        case 0:
            pow = pow1;
            break;
        case 1:
            pow = pow2;
            break;
        case 2:
            pow = pow3;
            break;
        case 3:
            pow = pow4;
            break;
    }
    d = Math.sqrt((x - playerX) * (x - playerX) + (y - playerY) * (y - playerY) + (z - playerZ) * (z - playerZ));
    pow.volume = 1.5 / (1 + d / 10);
    pow.play();
}

function doLogic() {
    if (seedTimer < frames) {
        seedTimer = frames + seedInterval * Math.random() * 10;
        spawnSeed();
    }
    for (i = 0; i < seeds.length; ++i) {
        seeds[i].vy += gravity;
        seeds[i].x += seeds[i].vx;
        seeds[i].y += seeds[i].vy;
        seeds[i].z += seeds[i].vz;
        if (frames - seeds[i].born > seedLife) {
            splode(seeds[i].x, seeds[i].y, seeds[i].z);
            seeds.splice(i, 1);
        }
    }
    for (i = 0; i < sparks.length; ++i) {
        if (sparks[i].alpha > 0 && sparks[i].radius > 5) {
            sparks[i].alpha -= .01;
            sparks[i].radius /= 1.02;
            sparks[i].vy += gravity;
            point = new Object();
            point.x = sparks[i].x;
            point.y = sparks[i].y;
            point.z = sparks[i].z;
            if (sparks[i].trail.length) {
                x = sparks[i].trail[sparks[i].trail.length - 1].x;
                y = sparks[i].trail[sparks[i].trail.length - 1].y;
                z = sparks[i].trail[sparks[i].trail.length - 1].z;
                d = ((point.x - x) * (point.x - x) + (point.y - y) * (point.y - y) + (point.z - z) * (point.z - z));
                if (d > 9) {
                    sparks[i].trail.push(point);
                }
            } else {
                sparks[i].trail.push(point);
            }
            if (sparks[i].trail.length > 5) sparks[i].trail.splice(0, 1);
            sparks[i].x += sparks[i].vx;
            sparks[i].y += sparks[i].vy;
            sparks[i].z += sparks[i].vz;
            sparks[i].vx /= 1.075;
            sparks[i].vy /= 1.075;
            sparks[i].vz /= 1.075;
        } else {
            sparks.splice(i, 1);
        }
    }
    p = Math.atan2(playerX, playerZ);
    d = Math.sqrt(playerX * playerX + playerZ * playerZ);
    d += Math.sin(frames / 80) / 1.25;
    t = Math.sin(frames / 200) / 40;
    playerX = Math.sin(p + t) * d;
    playerZ = Math.cos(p + t) * d;
    yaw = pi + p + t;
}

function rgb(col) {

    var r = parseInt((.5 + Math.sin(col) * .5) * 16);
    var g = parseInt((.5 + Math.cos(col) * .5) * 16);
    var b = parseInt((.5 - Math.sin(col) * .5) * 16);
    return "#" + r.toString(16) + g.toString(16) + b.toString(16);
}

function draw() {

    ctx.clearRect(0, 0, cx * 2, cy * 2);

    ctx.fillStyle = "#ff8";
    for (i = -100; i < 100; i += 3) {
        for (j = -100; j < 100; j += 4) {
            x = i;
            z = j;
            y = 25;
            point = rasterizePoint(x, y, z);
            if (point.d != -1) {
                size = 250 / (1 + point.d);
                d = Math.sqrt(x * x + z * z);
                a = 0.75 - Math.pow(d / 100, 6) * 0.75;
                if (a > 0) {
                    ctx.globalAlpha = a;
                    ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                }
            }
        }
    }
    ctx.globalAlpha = 1;
    for (i = 0; i < seeds.length; ++i) {
        point = rasterizePoint(seeds[i].x, seeds[i].y, seeds[i].z);
        if (point.d != -1) {
            size = 200 / (1 + point.d);
            ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
        }
    }
    point1 = new Object();
    for (i = 0; i < sparks.length; ++i) {
        point = rasterizePoint(sparks[i].x, sparks[i].y, sparks[i].z);
        if (point.d != -1) {
            size = sparks[i].radius * 200 / (1 + point.d);
            if (sparks[i].alpha < 0) sparks[i].alpha = 0;
            if (sparks[i].trail.length) {
                point1.x = point.x;
                point1.y = point.y;
                switch (sparks[i].img) {
                    case sparkPics[0]:
                        ctx.strokeStyle = "#f84";
                        break;
                    case sparkPics[1]:
                        ctx.strokeStyle = "#84f";
                        break;
                    case sparkPics[2]:
                        ctx.strokeStyle = "#8ff";
                        break;
                    case sparkPics[3]:
                        ctx.strokeStyle = "#fff";
                        break;
                    case sparkPics[4]:
                        ctx.strokeStyle = "#4f8";
                        break;
                    case sparkPics[5]:
                        ctx.strokeStyle = "#f44";
                        break;
                    case sparkPics[6]:
                        ctx.strokeStyle = "#f84";
                        break;
                    case sparkPics[7]:
                        ctx.strokeStyle = "#84f";
                        break;
                    case sparkPics[8]:
                        ctx.strokeStyle = "#fff";
                        break;
                    case sparkPics[9]:
                        ctx.strokeStyle = "#44f";
                        break;
                }
                for (j = sparks[i].trail.length - 1; j >= 0; --j) {
                    point2 = rasterizePoint(sparks[i].trail[j].x, sparks[i].trail[j].y, sparks[i].trail[j].z);
                    if (point2.d != -1) {
                        ctx.globalAlpha = j / sparks[i].trail.length * sparks[i].alpha / 2;
                        ctx.beginPath();
                        ctx.moveTo(point1.x, point1.y);
                        ctx.lineWidth = 1 + sparks[i].radius * 10 / (sparks[i].trail.length - j) / (1 + point2.d);
                        ctx.lineTo(point2.x, point2.y);
                        ctx.stroke();
                        point1.x = point2.x;
                        point1.y = point2.y;
                    }
                }
            }
            ctx.globalAlpha = sparks[i].alpha;
            ctx.drawImage(sparks[i].img, point.x - size / 2, point.y - size / 2, size, size);
        }
    }
}

function frame() {

    if (frames > 100000) {
        seedTimer = 0;
        frames = 0;
    }
    frames++;
    draw();
    doLogic();
    requestAnimationFrame(frame);
}

function initDate() {
    var random = ['云|想|衣|裳|花|想|容', '春|风|拂|槛|露|华|浓', '若|非|群|玉|山|头|见', '会|向|瑶|台|月|下|逢', '梨|花|淡|白|柳|深|青',
    '柳|絮|飞|时|花|满|城', '惆|怅|东|栏|一|株|雪', '人|生|看|得|几|清|明'];
    var index = Math.floor(Math.random()*(0 - 7) + 7);
    var D = new Date();
    var yy = D.getFullYear();
    var mm = D.getMonth() + 1;
    var dd = D.getDate();
    var ww = D.getDay();
    var ss = parseInt(D.getTime() / 1000);
    if (yy < 100) yy = "19" + yy;
    document.getElementById('lunar').innerHTML = calendar.getLunartoDay(yy + '-' + mm + '-' + dd);
    //调用js方法，参数分别是公历年、月、日；返回农历日期或农历节假日
    var aDate = calendar.getLunarFestival(yy + '-' + mm + '-' + dd);
    var festivalTop = "故";
    var festivalBottom = "乡";
    target = '|#countdown 3|'+ random[index] +'|#rectangle oo|';
    var chineseContext = '生活明朗，万物可爱，希望今年的你平安喜乐';
    var englishContext = 'Life is clear, everything is lovely, I hope you are safe and happy this year'
    var festival_context = '平安喜乐';
    var festival_btn = '开启贺卡';
    switch (aDate) {
        case '腊月廿三':
            festivalTop = "祭";
            festivalBottom = "灶";
            target = '|#countdown 3|李|雪|小|年|快|乐|#rectangle oo|';
            festival_context = '小年快乐';
            festival_btn = '开启小年贺卡';
            englishContext = 'I wish you happiness every day and always feel that the world is worth it';
            chineseContext = '时时遇快乐，人间常值得';
            break;
        case "腊月三十":
            festivalTop = "除";
            festivalBottom = "夕";
            target = '|#countdown 3|李|雪|除|夕|快|乐|#rectangle oo|';
            festival_context = '除夕快乐';
            festival_btn = '开启除夕贺卡';
            englishContext = 'I wish you all the best and all the best';
            chineseContext = '愿你一切尽意，百事从欢';
            break;
        case "腊月廿九":
            nextDay = calendar.getLunarFestival(yy + '-' + mm + '-' + dd);
            if (nextDay != '腊月三十') {
                festivalTop = "除";
                festivalBottom = "夕";
                target = '|#countdown 3|李|雪|除|夕|快|乐|#rectangle oo|';
                festival_context = '除夕快乐';
                festival_btn = '开启除夕贺卡';
                englishContext = 'I wish you all the best and all the best';
                chineseContext = '愿你一切尽意，百事从欢';
            }
            break;
        case "正月初一":
        case "正月初二":
        case "正月初三":
        case "正月初四":
        case "正月初五":
        case "正月初六":
            festivalTop = "春";
            festivalBottom = "节";
            target = '|#countdown 3|李|雪|春|节|快|乐|#rectangle oo|';
            festival_context = '春节快乐';
            festival_btn = '开启春节贺卡';
            englishContext = 'May you reunite with your ideals after walking through the mountains and rivers';
            chineseContext = '愿你走完山水万城，仍与理想重逢';
            break;
        case '正月十五':
            festivalTop = "元";
            festivalBottom = "宵";
            target = '|#countdown 3|李|雪|元|宵|节|快|乐|#rectangle oo|';
            festival_context = '元宵节快乐';
            festival_btn = '开启元宵贺卡';
            englishContext = 'May the heaven and earth be filled with joy, every year and tonight';
            chineseContext = '愿天上人间，占得欢娱，年年今夜';
            break;
    }
    $('.festival-top').html(festivalTop);
    $('.festival-bottom').html(festivalBottom);
    $('.festival-context').html(festival_context);
    $('.festival-btn').html(festival_btn);
    $('.englishContext').text(englishContext);
    $('.chineseContext').html(chineseContext);
    var height = window.screen.height;
    if (height > 812) {
        $('.festival-top, .festival-bottom').css("font-size", "180px");
    }
}
initDate();
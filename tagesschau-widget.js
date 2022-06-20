// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: globe-africa;
// created by u/iamrbn – https://github.com/iamrbn/

let widgetSize = config.widgetFamily;
let fm = FileManager.iCloud();
let dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget');
if (!fm.fileExists(dir)) fm.createDirectory(dir);
let df = new DateFormatter()
    df.dateFormat = 'dd.MM.yyyy, HH:mm'
let scriptVersion = 1.1.1
let scriptURL = 'https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/tagesschau-widget.js'
await saveImages()

let data;
try {
  data = await new Request('https://www.tagesschau.de/api2/homepage/').loadJSON();
} catch (e) {
  let errorWidget = await createErrorWidget();

  if (config.runsInApp) await errorWidget.presentMedium();
  else Script.setWidget(errorWidget);
  Script.complete();
}

  var breakingNews = ""
  if (data.news[0].breakingNews == true) breakingNews = '⚡️ '
  var artRessort = data.news[0].ressort
  if (artRessort == undefined) artRessort = 'Sonstiges';
  var shareURL = data.news[0].shareURL
  let wParameter = await args.widgetParameter;
  if (wParameter == null) shareURL = data.news[0].shareURL
  else if (wParameter.includes("app")) shareURL = data.news[0].shareURL.replace("https", "tagesschau-app")

if (config.runsInApp) {
  await presentMenu()
} else if (config.runsInWidget) {
  switch (widgetSize) {
    case "small": widget = await createSmallWidget();
      break;
    case "medium": widget = await createMediumWidget();
        if(wParameter.includes("detailview")) widget = await createMediumDetailWidget();
       else widget = await createMediumWidget();
      break;
    case "large": widget = await createLargeWidget();
        if(wParameter.includes("detailview")) widget = await createLargeDetailWidget();
       else widget = await createLargeWidget();
      break;
    case "extraLarge": widget = await createExtraLargeWidget();
        if(wParameter.includes("detailview")) widget = await createExtralargeDetailWidget();
       else widget = await createExtraLargeWidget();
      break;
    default: widget = await createMediumWidget();
    }
  Script.setWidget(widget)
};

//--------- CREATE SMALL WIDGET ---------
async function createSmallWidget() {
  let widget = new ListWidget();
      widget.setPadding(7, 7, 7, 4);
      widget.url = shareURL
  if (data.news[0].teaserImage.videowebl.imageurl == undefined) widget.backgroundImage = await getImageFor("background");
  else widget.backgroundImage = await loadImage(data.news[0].teaserImage.videowebl.imageurl);
      
  let headerImage = widget.addImage(await getImageFor('appIcon'));
      headerImage.imageSize = new Size(27, 27);
      headerImage.cornerRadius = 13
    
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available\nRun Script in App to update`)
      updateInfo.font = Font.semiboldSystemFont(10)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
  
      widget.addSpacer();

  let articleInfo = widget.addStack();
      articleInfo.bottomAlignContent()
      articleInfo.layoutVertically();

  let articleRessort = articleInfo.addText(artRessort.toUpperCase())
      articleRessort.textColor = Color.orange();
      articleRessort.font = Font.semiboldSystemFont(9);
      articleRessort.shadowColor = Color.black()
      articleRessort.shadowOffset = new Point(5, 5);
      articleRessort.shadowRadius = 3;

  let articleTitle = articleInfo.addText(breakingNews + data.news[0].title.replaceAll('+', '').trim());
      articleTitle.textColor = Color.white();
      articleTitle.font = Font.boldSystemFont(14);
      articleTitle.minimumScaleFactor = 0.4;
      articleTitle.shadowColor = Color.black()
      articleTitle.shadowOffset = new Point(2, 5);
      articleTitle.shadowRadius = 5;

  let articleDate = articleInfo.addText(df.string(new Date(data.news[0].date)) + " Uhr");
      articleDate.font = Font.semiboldSystemFont(8);
      articleDate.textOpacity = 0.7
      articleDate.textColor = Color.white()
      articleDate.shadowColor = Color.black()
      articleDate.shadowOffset = new Point(5, 5);
      articleDate.shadowRadius = 3;    

return widget
}

//--------- CREATE MEDIUM WIDGET ---------
async function createMediumWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 5, 10, 7);
      widget.backgroundImage = await getImageFor('background');
      
  let headerImage = widget.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(105, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
    
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`)
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
      
      widget.addSpacer(2)
          
  await createLargeArticleView(widget, 0);
  await createLargeArticleView(widget, 1);

return widget
};


//--------- CREATE MEDIUM DETAIL WIDGET ---------
async function createMediumDetailWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 10, 10, 10);
      widget.backgroundImage = await getImageFor('background');
      
  let headerImage = widget.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(105, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
    
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`)
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
      
      widget.addSpacer()
          
  let article = widget.addStack()
      article.spacing = 7
  
 if (data.news[0].teaserImage.videowebl.imageurl == undefined) articleImage = article.addImage(await getImageFor("Eilmeldung_NoThumbnailFound"));
 else articleImage = article.addImage(await loadImage(data.news[0].teaserImage.videowebl.imageurl));  
      articleImage.cornerRadius = 10
      articleImage.url = shareURL
      articleImage.applyFillingContentMode

  let articleInfo = article.addStack();
      articleInfo.layoutVertically();

  let articleRessort = articleInfo.addText(artRessort.toUpperCase()+" ↗")
      articleRessort.textColor = Color.orange();
      articleRessort.font = Font.semiboldMonospacedSystemFont(12);
      articleRessort.url = "https://tagesschau.de/"+artRessort

  let articleTitle = articleInfo.addText(breakingNews + data.news[0].title.replaceAll('+', '').trim());
      articleTitle.textColor = Color.white();
      articleTitle.font = Font.headline();
      articleTitle.minimumScaleFactor = 0.5;

  let articleDate = articleInfo.addText(df.string(new Date(data.news[0].date)) + " Uhr");
      articleDate.font = Font.italicSystemFont(10);
      articleDate.textColor = Color.gray()
      
      articleInfo.addSpacer()

return widget
};


// --------- CREATE LARGE WIDGET ---------
async function createLargeWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 10, 10, 10);
      widget.backgroundImage = await getImageFor('background')
      
  let headerStack = widget.addStack()
      headerStack.centerAlignContent()
      headerStack.spacing = 10
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(27, 27)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(145, 27);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
  
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`)
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
  
   widget.addSpacer()

  await createLargeArticleView(widget, 0);
  await createLargeArticleView(widget, 1);
  await createLargeArticleView(widget, 2);
  await createLargeArticleView(widget, 3);
  await createLargeArticleView(widget, 4);
  await createLargeArticleView(widget, 5);

return widget
};


// --------- CREATE LARGE DETAIL WIDGET ---------
async function createLargeDetailWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 10, 5, 10);
      widget.backgroundImage = await getImageFor('background')
      
  let headerStack = widget.addStack()
      headerStack.bottomAlignContent()
      headerStack.spacing = 12
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(25, 25)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(120, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
    
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`)
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
      
      widget.addSpacer(10);
      headerStack.addSpacer()
 
  let headerRessortStack = headerStack.addStack()
      headerRessortStack.setPadding(2, 6, 2, 6)
      headerRessortStack.cornerRadius = 7
      headerRessortStack.bottomAlignContent()
      headerRessortStack.backgroundColor = Color.darkGray()    
      headerRessortStack.url = "https://tagesschau.de/" + data.news[0].ressort
      
  let artRessort = headerRessortStack.addText(data.news[0].ressort.toUpperCase()+ "↗")
      artRessort.font = Font.semiboldSystemFont(9)
      artRessort.textColor = Color.orange()
      
  let artTitle = widget.addText(breakingNews + data.news[0].title.replaceAll('+', '').trim());
      artTitle.font = Font.boldSystemFont(15)
      artTitle.lineLimit = 1
      artTitle.minimumScaleFactor = 0.7
      artTitle.textColor = Color.white()
      artTitle.shadowColor = Color.black()
      artTitle.shadowOffset = new Point(3, 3);
      artTitle.shadowRadius = 5;

  let artFirstSentence = widget.addText(data.news[0].firstSentence)
      artFirstSentence.font = Font.regularSystemFont(13);
      artFirstSentence.minimumScaleFactor = 0.7
      artFirstSentence.textColor = Color.white()
      artFirstSentence.lineLimit = 2
      artFirstSentence.shadowColor = Color.black()
      artFirstSentence.shadowOffset = new Point(3, 3);
      artFirstSentence.shadowRadius = 5;
       
  widget.addSpacer(4)
  
  let imageStack = widget.addStack();
      imageStack.size = new Size(307, 163);
      imageStack.cornerRadius = 15
      imageStack.spacing = 10

  if (data.news[0].teaserImage.videowebl.imageurl == undefined) artImage = imageStack.addImage(await getImageFor("Eilmeldung_NoThumbnailFound"));
  else artImage = imageStack.addImage(await loadImage(data.news[0].teaserImage.videowebl.imageurl));  
       artImage.applyFillingContentMode();
       artImage.url = data.news[0].shareURL;
    
    widget.addSpacer(3)
    
  let artContent = widget.addText(data.news[0].content[0].value.replace(/<[^>]*>/g, ''))
      artContent.font = Font.regularSystemFont(12)
      artContent.textColor = Color.white()
      artContent.minimumScaleFactor = 0.8  
      
  let artDate = widget.addText("Stand: " + df.string(new Date(data.news[0].date)) + " Uhr");
      artDate.font = Font.italicSystemFont(9)
      artDate.textColor = Color.gray()

return widget; 
};


//--------- CREATE EXTRA LARGE WIDGET ---------
//Extra large widgets are only supported on iPads running iOS 15 and newer.
async function createExtraLargeWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 10, 10, 13);
      widget.backgroundImage = await getImageFor('background')
      
  let headerStack = widget.addStack()
      headerStack.centerAlignContent()
      headerStack.setPadding(0, 245, 0, 0)
      headerStack.spacing = 9
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(27, 27)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(135, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
          
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Starte Script im in App Modus zum updaten`)
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
      
      widget.addSpacer()
      
  let mainStack = widget.addStack()
      mainStack.spacing = 7
  let leftStack = mainStack.addStack()
      leftStack.layoutVertically()
  let rightStack = mainStack.addStack()
      rightStack.layoutVertically()
          
  await createLargeArticleView(leftStack, 0);
  await createLargeArticleView(leftStack, 1);
  await createLargeArticleView(leftStack, 2);
  await createLargeArticleView(leftStack, 3);
  await createLargeArticleView(leftStack, 4);
  
  await createLargeArticleView(rightStack, 5);
  await createLargeArticleView(rightStack, 6);
  await createLargeArticleView(rightStack, 7);
  await createLargeArticleView(rightStack, 8);
  await createLargeArticleView(rightStack, 9);
  
  widget.addSpacer();
      
return widget;
};


//--------- CREATE EXTRA LARGE DETAIL WIDGET ---------
//Extra large widgets are only supported on iPads running iOS 15 and newer.
async function createExtralargeDetailWidget() {
  let widget = new ListWidget();
      widget.setPadding(12, 15, 10, 15);
      widget.backgroundImage = await getImageFor('background')
      
  let headerStack = widget.addStack()
      headerStack.bottomAlignContent()
      headerStack.setPadding(0, 245, 0, 0)
      headerStack.spacing = 9
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(27, 27)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(135, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
          
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Starte Script im in App Modus zum updaten`)
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
    
  let mainStack = widget.addStack()
      mainStack.spacing = 14
      mainStack.centerAlignContent()
  let leftStack = mainStack.addStack()
      leftStack.layoutVertically()
      leftStack.cornerRadius = 10
      leftStack.size = new Size(325, 300)
  let rightStack = mainStack.addStack()
      rightStack.layoutVertically()
          
  let headerRessortStack = leftStack.addStack()
      headerRessortStack.setPadding(4, 6, 4, 6)
      headerRessortStack.cornerRadius = 7
      headerRessortStack.bottomAlignContent()
      headerRessortStack.url = "https://tagesschau.de/"+ data.news[0].ressort
      headerRessortStack.backgroundColor = Color.darkGray()
      
  let artRessort = headerRessortStack.addText(data.news[0].ressort.toUpperCase() + " ↗")
      artRessort.font = Font.semiboldSystemFont(9)
      artRessort.textColor = Color.orange()
      
  let artTitle = leftStack.addText(breakingNews + data.news[0].title.replaceAll('+', '').trim());
      artTitle.font = Font.boldSystemFont(15)
      artTitle.textColor = Color.white()
      artTitle.shadowColor = Color.black()
      artTitle.lineLimit = 1
      artTitle.minimumScaleFactor = 0.8
      artTitle.shadowOffset = new Point(3, 3);
      artTitle.shadowRadius = 7;

  let artFirstSentence = leftStack.addText(data.news[0].firstSentence)
      artFirstSentence.font = Font.regularSystemFont(13);
      artFirstSentence.textColor = Color.white()
      artFirstSentence.minimumScaleFactor = 0.8
      artFirstSentence.lineLimit = 2
      artFirstSentence.shadowColor = Color.black()
      artFirstSentence.shadowOffset = new Point(3, 3);
      artFirstSentence.shadowRadius = 7;
      
      leftStack.addSpacer(2)
  
  let imageStack = leftStack.addStack();
      imageStack.size = new Size(320, 165);
      imageStack.cornerRadius = 20
      imageStack.spacing = 10
	
  if (data.news[0].teaserImage.videowebl.imageurl == undefined) artImage = imageStack.addImage(await getImageFor("Eilmeldung_NoThumbnailFound"))
  else artImage = imageStack.addImage(await loadImage(data.news[0].teaserImage.videowebl.imageurl))
	   artImage.applyFillingContentMode();
  	   artImage.url = data.news[0].shareURL;
  
      leftStack.addSpacer(2)
    
  let artContent = leftStack.addText(data.news[0].content[0].value.replace(/<[^>]*>/g, ''))
      artContent.font = Font.regularSystemFont(12)
      artContent.textColor = Color.white()
      artContent.minimumScaleFactor = 0.8

  let articleDate = leftStack.addText("Stand: " + df.string(new Date(data.news[0].date)) + " Uhr");
      articleDate.font = Font.italicSystemFont(9)
      articleDate.textColor = Color.gray()
  
  //-------------------
  
  await createLargeArticleView(rightStack, 1);
  await createLargeArticleView(rightStack, 2);
  await createLargeArticleView(rightStack, 3);
  await createLargeArticleView(rightStack, 4);
  await createLargeArticleView(rightStack, 5);
  
      widget.addSpacer(5);
      
return widget;
};


async function createLargeArticleView(widget, lineNmbr) {
if (data.news[lineNmbr] == undefined) lineNmbr -= 1;

      widget.addSpacer(3)
  let main_lineNmbr = widget.addStack()
      main_lineNmbr.backgroundColor = new Color('#41414180')
      main_lineNmbr.cornerRadius = 7
      main_lineNmbr.spacing = 5
      main_lineNmbr.url = data.news[lineNmbr].shareURL
      
  let image_lineNmbr = main_lineNmbr.addStack()
         
  let article_lineNmbr = main_lineNmbr.addStack()
      article_lineNmbr.layoutVertically()
      article_lineNmbr.topAlignContent()
   
  if (data.news[lineNmbr].breakingNews == true) breakingNews = '⚡️ '     
  if (data.news[lineNmbr].teaserImage.videowebl.imageurl == undefined) img =  image_lineNmbr.addImage(await getImageFor("Eilmeldung_NoThumbnailFound"))
  else img = image_lineNmbr.addImage(await loadImage(data.news[lineNmbr].teaserImage.videowebl.imageurl))
       img.cornerRadius = 7 
      
      article_lineNmbr.addSpacer(2)
      
  if (data.news[lineNmbr].ressort == undefined) data.news[lineNmbr].ressort = 'Sonstiges';
  let ressort = article_lineNmbr.addText(data.news[lineNmbr].ressort.toUpperCase())
      ressort.textColor = Color.orange();
      ressort.font = Font.semiboldMonospacedSystemFont(9);
      
  let title = article_lineNmbr.addText(breakingNews + data.news[lineNmbr].title.replaceAll('+', '').trim())
      title.textColor = Color.white();
      title.font = Font.boldMonospacedSystemFont(10)
      title.minimumScaleFactor = 0.5;
      
  let date = article_lineNmbr.addText(df.string(new Date(data.news[lineNmbr].date))+" Uhr");
      date.font = Font.italicSystemFont(8);
      date.textOpacity = 0.5
      date.textColor = Color.white()
      
      main_lineNmbr.addSpacer()
      widget.addSpacer(3)
};


function createErrorWidget() {
  let errorWidget = new ListWidget();

  let bgGradient = new LinearGradient();
      bgGradient.locations = [0, 1];
      bgGradient.colors = [new Color('#2D65AE'), new Color('#19274C')];

      errorWidget.backgroundGradient = bgGradient;

  let title = errorWidget.addText('tagesschau');
      title.font = Font.headline();
      title.centerAlignText();

      errorWidget.addSpacer(10);

  let errTxt = errorWidget.addText('Es besteht keine Verbindung zum Internet');
      errTxt.font = Font.semiboldMonospacedSystemFont(16);
      errTxt.textColor = Color.red();

  let errTxt2 = errorWidget.addText('Dieses Widget benötigt eine Verbindung zum Internet um funktionieren zu können!');
      errTxt2.font = Font.regularRoundedSystemFont(14);
      errTxt2.textColor = Color.red();
      errTxt2.textOpacity = 0.8;

  return errorWidget;
};


//=======================================\\
//============ FUNCTION AREA ============\\
//=======================================\\

async function loadImage(url) {
  return await new Request(url).loadImage();
};

async function saveImages() {
  let imgs = {
background:"http://www.tagesschau.de/infoscreen/img/background-16-9-HD.png",
header:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tagesschau_Logo_2015.svg/462px-Tagesschau_Logo_2015.svg.png",
appIcon:"https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/e4/53/54/e45354a1-b99f-8a00-2d1c-d260607c2ec0/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png",
Eilmeldung_NoThumbnailFound:"https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/Eilmeldung_NoThumbnailFound.png"}
  for (img in imgs) {
    imgName = img + ".png"
    imgPath = fm.joinPath(dir, imgName);
   if (!fm.fileExists(imgPath)) {
      req = new Request(imgs[img]);
      img = await req.loadImage();
      fm.writeImage(imgPath, img);
    }
  }
};

async function getImageFor(name) {
  imgPath = fm.joinPath(dir, name + ".png")
  await fm.downloadFileFromiCloud(imgPath)
  img = await fm.readImage(imgPath)
 return img;
};

async function presentMenu() {
  if (!Device.isPad() || Device.systemVersion() < 15) ipadOpt =  " ❌ (not available on device)"
  else ipadOpt = ""
  let alert = new Alert();
      alert.title = data.news[0].topline + " [" + artRessort.toUpperCase() + "]"
      alert.message = data.news[0].title
      alert.addAction("Small")
      alert.addAction("Medium")
      alert.addAction("Medium Detail")
      alert.addAction("Large")
      alert.addAction("Large Detail")
      alert.addAction("Extra Large"+ipadOpt)
      alert.addAction("Extra Large Detail"+ipadOpt)
      alert.addDestructiveAction("Kompletter Artikel ↗")
      alert.addCancelAction("Cancel")
  let idx = await alert.presentSheet()
  if (idx == 0) {
    widget = await createSmallWidget()
    await widget.presentSmall()
  } else if (idx == 1) {
    widget = await createMediumWidget()
    await widget.presentMedium()
  } else if (idx == 2) {
    widget = await createMediumDetailWidget()
    await widget.presentMedium()
  } else if (idx == 3) {
    widget = await createLargeWidget()
    await widget.presentLarge()
  } else if (idx == 4) {
    widget = await createLargeDetailWidget()
    await widget.presentLarge()
  } else if (idx == 5) {
    widget = await createExtraLargeWidget()
    await widget.presentExtraLarge()
  } else if (idx == 6) {
    widget = await createExtralargeDetailWidget()
    await widget.presentExtraLarge()
  } else if (idx == 7) {
    Safari.openInApp(shareURL, false)
  }
};

//checks if's there an server update available
async function updateCheck(version) {
  let uC;
 try {
  let updateCheck = new Request(`${scriptURL}on`)
      uC = await updateCheck.loadJSON()
 } catch (e) {return log(e)}
  
  log(uC)
  
  let needUpdate = false
  if (uC.version != version) {
      needUpdate = true
      console.warn(`Server Version ${uC.version} Verfügbar!`)
    if (!config.runsInWidget) {
      let newAlert = new Alert()
          newAlert.title = `Server Version ${uC.version} Verfügbar!`
          newAlert.addAction("OK")
          newAlert.addDestructiveAction("Später")
          newAlert.message="Änderungen:\n" + uC.notes + "\n\nOK klicken für den Download von GitHub"
      if (await newAlert.present() == 0) {
        let req = new Request(scriptURL)
        let updatedCode = await req.loadString()
        let fm = FileManager.iCloud()
        let path = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
        log(path)
        fm.writeString(path, updatedCode)
        throw new Error("Update Komplett!")
      }
    }
  } else {log("up to date")}

  return needUpdate, uC;
};

//=======================================\\
//============ END OF SCRIPT ============\\
//=======================================\\


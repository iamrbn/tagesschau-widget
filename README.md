# <img title="tagesschau icon" src="https://www.tagesschau.de/res/assets/image/favicon/favicon.ico" href="https://www.tagesschau.de/api2/homepage/" width="30"/> tagesschau-widget for Scriptable
Based on this [reddit post](https://www.reddit.com/r/Scriptable/comments/jm17ra/tagesschaude_widget/?utm_source=share&utm_medium=web2x&context=3) of [u/trbn_hck](https://www.reddit.com/user/trbn_hck/)    
Unfortunately the [Repositorie](https://github.com/trbnhck/scriptable-scripts/tree/main/tagesschau-widget) in his [GitHub profile](https://github.com/trbnhck) is no longer exist.  

![](https://img.shields.io/badge/dynamic/json?color=0259B3&style=flat&label=Script%20Version&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fiamrbn%2Ftagesschau-widget%2Fmain%2Ftagesschau-widget.json)

## Widget übersicht 👀

<img title="Overview Widget" src="Images/overviewWidgets.png" width="1000"/>
<br>

## Features ✨

### Verfügbare widget größen
- small
- medium [detail & list view]
- large [detail & list view]
- extra large [detail & list view] (nur iPadOS15 und höher)

<br>

### Klickbare Elemente

<img title="Clickable Elements" src="Images/clickableElements.png" width="1000"/>

Bei den "detailview" Widgets ist ausschließlich das Titelbild klickbar und führt zum entsprechenden Artikel.
Zudem sind in den "detailview" Widgets die **Ressort** Tags Klickbar und führen zur entsprechenden Ressort Übersicht (_Ausgenonnem ist "Sonstiges"_)
Bei den "listview" bzw. normalen widgets ist der komplette jeweilige "Stack" (_graue hintergrund_) klickbar. 

<br>

### ++ Eilmeldung ++ No Thumbnail Found
Sollte es noch oder überhaupt kein Titelbild zu einem Artikel geben (_Grund Eilmeldung_) so wird ein Platzhalter verwendet um eine Fehlermeldung zu vermeiden.
<p align="center">
<img title="Example No Thumbnail Found - Medium-Widget" src="Images/Eilmeldung_NoThumbnailFound_exampleMedium.PNG" width="450"/>
   </p>

<br>

### Feed Ansicht
In der Feed Ansicht kann die Übersicht News oder Regional ausgewählt werden.

<img title="Ressort Regional oder News Auswählen" src="Images/selectRessort.png" width="250"/>
Was Ausgewählt wurde wird später im Header angezeigt.
Zudem zeigt der Feed u. a. farblich an ob ein Artikel eine Eilmeldung ist.
Jedes einzelne Zeile ist klickbar und führt zum jeweiligen Artikel.

<p align="center">
<img title="Feed Ansicht (News) iPhone" src="Images/FeedAnsichtiPhone.PNG" width="250"/> <img title="Feed Ansicht (Regional) iPad" src="Images/FeedAnsichtiPad.PNG" width="750"/>
   </p>


<br>

### Push Notifications
Es kann eingestellt werden ob du Nachrichten über Neue Meldungen vom Feed und neue Folgen von "tagesschau in 100 Sekunden" erhalten möchtest.

```JavaScript
let enableNotifications = true //true: Neue Pushnachrichten erlabut, ansonsten 'false'
let tagesschau100sec = true //true für Push-Notifications bei neuer Folge
```
<p align="center">
<img title="Push Notification Feed" src="Images/PushNotificationFeed.PNG" width="300"/> <img title="Push Notification Tagesschau in 100 Sekunden" src="Images/PushNotificationTS100Sek.gif" width="300"/>
   </p>
   
<br>

### Script Settings
Im Script können neben dem erlauben von Push Notifications auch den ungefähren [^1] Refresh Intervall des Widgets einstellen zudem den standard Feed-Typ eingestellt werden.
` news ` oder ` regional `

```javascript
let refreshInt = 30 //Refresh Intervall der einzelnen Widgets in Minuten eingeben
let feedType = 'news' //Standard Feed Typ eingeben 'news' oder 'regional' möglich
```

<br>

### Widget Parameter

#### ` app `    
~~Wenn im jeweiligen Widget Parametern der Begriff "app" eingetragen wird, werden beiträge aus diesem widget beim anklicken in der [tagesschau-app](https://apps.apple.com/de/app/tagesschau-nachrichten/id401644893) geöffnet. Standard ist der web-browser.~~ - wurde im release `1.2` entfernt!

#### ` detailview `    
Beim eintragen des Keywords "detailview" wird der erste Artikel in der Detailansicht präsentiert.

#### ` Ressort `
Widgets können mit den keywords "news" oder "regional" den jeweilgen Feed anzeigen.

**Wichtig:** Sollten beide optionen gewünscht sein so sollten die jeweiligen Keywords getrennt werden d. h. durch z.B. ein Semicolon `;` (Bsp. `regional;detailview`)
<br>

### In App Lauf
Beim starten des Scripts in der App wird als erstes ein Menu angezeigt.     
Dieses zwigt in der Headline den aktuellsten Titel, Topline + Ressort.     
Zudem wird angezeigt ob das `extraLarge Widget` auf dem Gerät unterstützt wird. Voraussetzung ist ein iPad mit iPadOS **15** oder neuer.    
<p align="center">
<img title="In App Menu iPhone" src="Images/iPhoneMenu.png" width="250"/> <img title="In App Menu iPad" src="Images/iPadMenu.png" width="755"/>
   </p>

<br>

### Erster Lauf
Beim ersten Lauf wird im Scriptable Ordner ein neuer Ordner erstellt mit dem Namen "tagesschau-widget"
In diesem werden die drei unten aufgeführten Bilder abgelegt.

```
iCloud Drive/
├─ Scriptable/
│  ├─ tagesschau-widget/
│  │  ├─ header.png
│  │  ├─ appIcon.png
│  │  ├─ appIconRounded.png
│  │  ├─ background.png
│  │  ├─ Eilmeldung_NoThumbnailFound.png
```
<img title="header.png" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tagesschau_Logo_2015.svg/462px-Tagesschau_Logo_2015.svg.png" width="350"/> <img title="appIcon.png" src="https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/e4/53/54/e45354a1-b99f-8a00-2d1c-d260607c2ec0/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png" width="70"/> <img title="appIconRounded.png" src="Images/appIconRounded.png" width="70"/> <img title="background.png" src="http://www.tagesschau.de/infoscreen/img/background-16-9-HD.png" width="125"/> <img title="Eilmeldung_NoThumbnailFound.png" src="Images/Eilmeldung_NoThumbnailFound.png" width="125"/>

<br>

### Selfupdate Funktion
Das Script verfügt über eine Selbstupdate Funktion[^2]. Der User bekommt nach dem Script Update auf GitHub eine benachrichtigung das eine neue Version zur verfügung steht.
<p align="center">
<img title="Update Notification" src="Images/updateNotification1.1.1.png" width="425"/>
</p>


<h2 style="font-size:1"
<p align="center" style="font-size:10vw">
   <a href="https://github.com/iamrbn/tagesschau-widget/blob/main/README.md"> ⬆️ Nach Oben Springen </a>
</p>
</h2>


 
<p align="center">
  <a href="https://reddit.com/user/iamrbn/">
    <img title="My second Reddit @iamrbn" src="https://github.com/iamrbn/slack-status/blob/08d06ec886dcef950a8acbf4983940ad7fb8bed9/Images/Badges/reddit_black_iamrbn.png" width="150"/>
  </a>
  <a href="https://twitter.com/iamrbn_/">
    <img title="Follow Me On Twitter @iamrbn_" src="https://github.com/iamrbn/slack-status/blob/ae62582b728c2e2ad8ea6a55cc7729cf71bfaeab/Images/Badges/twitter_black.png" width="155"/>
  </a>
</p>

<br>

___

[^1]:[refreshAfterDate](https://docs.scriptable.app/listwidget/#refreshafterdate "Scriptable Documentation") 

1. ListWidget()     
refreshAfterDate: Date
> The property indicates when the widget can be refreshed again. The widget will not be refreshed before the date have been reached. It is not guaranteed that the widget will refresh at exactly the specified date.

> The refresh rate of a widget is partly up to iOS/iPadOS. For example, a widget may not refresh if the device is low on battery or the user is rarely looking at the widget.    

Source: Scriptable Documentation

[^2]:[Function](https://github.com/mvan231/Scriptable#updater-mechanism-code-example "GitHub Repo") is written by the amazing [@mvan231](https://twitter.com/mvan231 "Twitter")

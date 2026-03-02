
class WeatherApp{

   constructor(){
       this.apiKey=config.apiKey;
       this.weatherForm=document.getElementById("weather-form");
       this.searchButton=document.getElementById("search-button");
       this.searchInput=document.getElementById("weather-input");
       this.loadingMessage=document.getElementById("loading-message");
       this.errorHeader=document.getElementById("error-header");
       this.pageHeader=document.querySelector("header");
       this.weatherContainer=document.querySelector(".weather-container");
       this.deegresHeader=document.getElementById("deegres-header");
       this.weatherIcon=document.getElementById("weather-icon");
       this.tempIconContainer=document.querySelector(".temp-icon-container");
       this.locationButton=document.getElementById("location-button");
       this.celsiusItem=document.getElementById("celcious-item");
       this.celsiusItem.disabled=true;
       this.fahrItem=document.getElementById("fahr-item");
       this.toCelsius=true;
       this.toFahreneit=false;
       this.intervalId;
       this.date=new Date();
       this.currentDay=this.date.getDay();
       this.forecastDays=this.date.getDay();
       this.forecastItems=document.querySelectorAll(".forecast-item");
       this.forecastTemps=document.querySelectorAll(".forecast-temp");
       this.forecastIcons=document.querySelectorAll(".forecast-icon");
       this.forecastTime=document.querySelectorAll(".forecast-time");   
       this.forecastDate=document.querySelectorAll(".forecast-date");
       this.forecastDaysItems=document.querySelectorAll(".forecast-item-days");
       this.forecastIconDays=document.querySelectorAll(".forecast-icon-days");
       this.forecastTempDays=document.querySelectorAll(".forecast-temp-days");
       this.forecastDateDays=document.querySelectorAll(".forecast-date-days");
       this.forecastMinTemp=document.querySelectorAll(".min-forecast-temp");
       this.averageForecastTemp=document.querySelectorAll(".average-forecast-temp");
       this.innit();
   }

   innit(){
      this.initializeEventListeners();
   }

   initializeEventListeners(){
       this.searchButton.addEventListener("click",()=>{
           this.fetchData();
       });

       this.weatherForm.addEventListener("submit",event=>{
          event.preventDefault();
       })

       this.searchInput.addEventListener("keyup",event=>{
          if(event.key==="Enter")
             this.fetchData();
       });

       this.locationButton.addEventListener("click",()=>{
          this.getLocationButton();
       });

       this.fahrItem.addEventListener("click",()=>{
         this.setDegreesActive(this.fahrItem,this.celsiusItem);
         this.toFahreneit=true;
         this.toCelsius=false;
         this.convertTemp();
         this.fahrItem.disabled=true;
         this.celsiusItem.disabled=false;
       });

       this.celsiusItem.addEventListener("click",()=>{
         this.setDegreesActive(this.celsiusItem,this.fahrItem);   
         this.toCelsius=true;
         this.toFahreneit=false;
         this.convertTemp();
         this.fahrItem.disabled=false;
         this.celsiusItem.disabled=true;
       });
   }

   async fetchData(){
       try{
         this.loadingMessage.style.display="block";
           const weatherSearch=this.searchInput.value.toLowerCase();
           clearInterval(this.intervalId);
           this.currentDay=this.date.getDay();
           this.forecastDays=this.date.getDay();
           if(weatherSearch.trim()!==""){
              const citysName=document.getElementById("citys-name");
              const response= await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${weatherSearch}&appid=${this.apiKey}&units=metric`);
              if(!response.ok){
                 throw new Error("Cannot fetch the resource");
               }
               this.loadingMessage.style.display="none";
               this.errorHeader.style.display="none";   
               const weatherData=await response.json();
               this.callFunctions(weatherData,citysName);
           }else{
               this.loadingMessage.style.display="none";
              this.displayError();
           }
       }catch(error){
         this.loadingMessage.style.display="none";
          console.error(error);
          this.displayError();
       }
   }

   callFunctions(weatherData,citysName){
      this.animateWeatherData(this.tempIconContainer);
      this.animateWeatherData(citysName);
      this.displayWeatherStats(weatherData,citysName);
      this.displayIcon(weatherData);
      this.getWeatherDescription(weatherData);
      this.displayHumidity(weatherData);
      this.displayFeelsLikeTemp(weatherData);
      this.displayWindData(weatherData);
      let maxIndex=this.getMaxIndex(weatherData);
      this.getMaxTemp(weatherData,maxIndex);
      this.getMinTemp(weatherData,maxIndex);
      this.displayDateText(weatherData);
      this.createForecastItems(weatherData,maxIndex);
      this.displayForecast5Days(weatherData);
   }

   displayWeatherStats(weatherData,citysName){
      this.weatherContainer.style.display="flex";
      citysName.textContent=weatherData.city.name;
      if(this.toFahreneit)
         this.deegresHeader.textContent=`${((weatherData.list[0].main.temp*9/5)+32).toFixed(0)}°F`;
      else
         this.deegresHeader.textContent=`${weatherData.list[0].main.temp.toFixed(0)}°C`;
      this.setWeatherColor(weatherData.list[0].main.temp.toFixed(0));
   }

   setWeatherColor(weatherCity){
      let citysTemp=Number(weatherCity);
      if(citysTemp>24)
        this.deegresHeader.style.color="rgb(219, 106, 0)";
      else if(citysTemp>=6 && citysTemp<=24)
        this.deegresHeader.style.color="rgb(177, 177, 177)";
      else if(citysTemp<=5)
        this.deegresHeader.style.color="rgba(9, 9, 255, 0.938)";
   }

   animateWeatherData(elementToAnimate){
      elementToAnimate.animate([
         {transform:"translateX(-1000px)"},
         {transform:"translateX(0px)"}
      ],{
         duration:800,
         easing:"ease-out",
         fill:"forwards"
      });
   }

   getLocationButton(){
      navigator.geolocation.getCurrentPosition(position=>{
         const lat=position.coords.latitude;
         const lon=position.coords.longitude;   
         this.fetchDataWithCoords(lat,lon);
      });
   }

   async fetchDataWithCoords(lat,lon){
      try{
         this.loadingMessage.style.display="block";
         const response=await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`);
         if(!response.ok)
            throw new Error("cannot fetch the resource");
         this.loadingMessage.style.display="none";
         this.errorHeader.style.display="none";
         clearInterval(this.intervalId);
         this.currentDay=this.date.getDay();
         this.forecastDays=this.date.getDay();
         const weatherData=await response.json();
         const citysName=document.getElementById("citys-name");
         this.callFunctions(weatherData,citysName);  
      }catch(error){
         console.error(error);
      }
   }

   displayError(){
      this.errorHeader.style.display="block";
   }

   displayIcon(weatherData){
      if(weatherData.list[0].weather[0].main===`Clouds`){
          this.weatherIcon.textContent="☁️";
          document.body.style.backgroundImage="url(images/clouds.jpg)";
      }else if(weatherData.list[0].weather[0].main===`Rain`){
          this.weatherIcon.textContent="🌧️";
          document.body.style.backgroundImage="url(images/rainBack.avif)";
      }else if(weatherData.list[0].weather[0].main===`Clear`){
        this.weatherIcon.textContent="☀️";
        document.body.style.backgroundImage="url(images/sunback.jpg)";
      }else if(weatherData.list[0].weather[0].main===`Snow`){
          this.weatherIcon.textContent="❄️";
          document.body.style.backgroundImage="url(images/snowBack.jpg)";
      }else if(weatherData.list[0].weather[0].main==='Thunderstorm')
          this.weatherIcon.textContent="⛈️";
      else if(weatherData.list[0].weather[0].main==='Drizzle'){
          this.weatherIcon.textContent="🌦️";
         document.body.style.backgroundImage="url(/icons/rainBack.avif)";
      }else if(weatherData.list[0].weather[0].main==='Mist')
          this.weatherIcon.textContent="🌫️";
        else
          this.weatherIcon.textContent="🌫️"; 
   }

   getWeatherDescription(weatherData){
      const weatherDescription=document.getElementById("weather-description");
      weatherDescription.textContent=weatherData.list[0].weather[0].description;
   }

   displayHumidity(weatherData){
      const humidityText=document.getElementById("humidity-text");
      humidityText.textContent=`Humidity : ${weatherData.list[0].main.humidity}`;
   }

   displayFeelsLikeTemp(weatherData){
      const feelsLikeText=document.getElementById("feels-like-text");
      feelsLikeText.textContent=`Feels Like : ${weatherData.list[0].main.feels_like.toFixed(0)}°C`;
   }

   displayWindData(weatherData){
       const windSpeed=document.getElementById("wind-speed");
       const windDeg=document.getElementById("wind-deg");
       windSpeed.textContent=`Wind Speed : ${weatherData.list[0].wind.speed}`;
       windDeg.textContent=`Wind Degrees : ${weatherData.list[0].wind.deg}`;
   }

   getMaxIndex(weatherData){
         let time=weatherData.list[0].dt_txt;
         time=time.slice(time.indexOf(" "));
         time=time.trim();
         let maxIndex;
         if(time===`18:00:00`){
            maxIndex=2;
         }else if(time===`21:00:00`){
            maxIndex=1;
         }else if(time===`00:00:00`){
            maxIndex=8;
         }else if(time===`03:00:00`){
            maxIndex=7;
         }else if(time===`06:00:00`){
            maxIndex=6;
         }else if(time===`09:00:00`)
            maxIndex=5;
         else if(time===`12:00:00`)
            maxIndex=4;
         else if(time===`15:00:00`)
            maxIndex=3;
         return maxIndex;
   }

   getMaxTemp(weatherData,maxIndex){
      const maxTemp=document.getElementById("max-temp");
      let max=weatherData.list[0].main.temp;
      for(let i=0;i<maxIndex;i++){
         if(max<weatherData.list[i].main.temp){
            max=weatherData.list[i].main.temp;
         }
      }
      maxTemp.innerHTML=`<i class="fa-solid fa-temperature-arrow-up"></i> ${max.toFixed(0)}°C`;
   }

   getMinTemp(weatherData,maxIndex){
      const minTemp=document.getElementById("min-temp");
      let min=weatherData.list[0].main.temp;
      for(let i=0;i<maxIndex;i++){
         if(min>weatherData.list[i].main.temp){
            min=weatherData.list[i].main.temp;
         }
      }
      minTemp.innerHTML=`<i class="fa-solid fa-temperature-arrow-down"></i> ${min.toFixed(0)}°C`;
   }
     
   displayDateText(weatherData){
      this.intervalId=setInterval(()=>{
         const date=new Date();
         const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
         const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
         const dateText=document.getElementById("date-text");
         let currentDay=date.getDay()-1;
         if(currentDay===-1)
            currentDay=days.length-1;
         dateText.textContent=`${days[currentDay]} ${date.getDate()} ${months[date.getMonth()]}`;
      },1000);
   }

   setDegreesActive(activateHeader,deactivateHeader){
      activateHeader.style.backgroundColor="rgb(39, 115, 255)";
      activateHeader.style.textDecoration="underline";
      deactivateHeader.style.backgroundColor="transparent";
      deactivateHeader.style.textDecoration="none";
   }

   convertTemp(){
      const temp=[...this.deegresHeader.textContent];
      let count=0;
      let numberTemp=" ";
      while(true){
         if(temp[count]==='°')
            break;
         numberTemp+=temp[count];
         count++;
      }
      numberTemp=numberTemp.trim();
      numberTemp=Number(numberTemp);
      if(this.toCelsius){
         this.deegresHeader.textContent=`${((numberTemp-32)*5/9).toFixed(0)}°C`;
      }else if(this.toFahreneit){
         this.deegresHeader.textContent=`${((numberTemp*9/5)+32).toFixed(0)}°F`;
      }
   }

   getSecondMaxIndex(maxIndex){
      if(maxIndex===8)
         return 16;
      else if(maxIndex===7)
         return 15;
      else if(maxIndex===6)
         return 14;
      else if(maxIndex===5)
         return 13;
      else if(maxIndex===4)
         return 12;
      else if(maxIndex===3){
         return 11;
      }
      else if(maxIndex===2)
         return 10;
      else if(maxIndex===1)
         return 9;
   }

   createForecastItems(weatherData,maxIndex){
      let maxIndex2=this.getSecondMaxIndex(maxIndex);
      this.getForecastIcon(weatherData,maxIndex2);
      const date=new Date();
      const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      let localDate=date.getDate();
      let day;
      let month=months[date.getMonth()];
      for(let i=0;i<maxIndex2;i++){
         let timeText=weatherData.list[i].dt_txt;
         timeText=timeText.slice(timeText.indexOf(" "),timeText.lastIndexOf(":00"));
         timeText=timeText.trim();
         localDate=this.getForecastDay(weatherData,i);
         day=this.increaseWeekDay(timeText,i);
         this.forecastItems[i].style.display="flex";
         this.forecastTemps[i].textContent=`${weatherData.list[i].main.temp.toFixed(0)}°C`;
         this.forecastTime[i].textContent=timeText;
         this.forecastDate[i].textContent=`${day} ${localDate} ${month}`;
      }
   }

   increaseWeekDay(timeText,index){
      const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
      if(timeText===`00:00` && index!==0){
         this.currentDay++;
      }
      let changeDay=this.currentDay-1;
      if(changeDay===-1)
         changeDay=days.length-1;

      return days[changeDay];
   }

   increaseDay(weatherData,index){
      const currentDay=weatherData.list[index].dt_txt;
      return currentDay.slice(currentDay.lastIndexOf("-")+1,currentDay.indexOf(" ")).trim();
   }

   getForecastIcon(weatherData,maxIndex){
      for(let i=0;i<maxIndex;i++){
         if(weatherData.list[i].weather[0].main===`Clouds`){
              this.forecastIcons[i].textContent="☁️"
         }else if(weatherData.list[i].weather[0].main===`Rain`){
              this.forecastIcons[i].textContent="🌧️";
        }else if(weatherData.list[i].weather[0].main===`Clear`){
             this.forecastIcons[i].textContent="☀️";
        }else if(weatherData.list[i].weather[0].main===`Snow`){
            this.forecastIcons[i].textContent="❄️";
        }else if(weatherData.list[i].weather[0].main==='Thunderstorm')
            this.forecastIcons[i].textContent="⛈️";
        else if(weatherData.list[i].weather[0].main==='Drizzle'){
            this.forecastIcons[i].textContent="🌦️";
        }else if(weatherData.list[i].weather[0].main==='Mist')
            this.forecastIcons[i].textContent="🌫️";
        else
          this.forecastIcons[i].textContent="🌫️"; 
      }
   }

   displayForecast5Days(weatherData){
      let currentIndex=this.getCurrentIndex(weatherData);
      this.get5DaysForecastIcon(weatherData,0,0);
      this.averageForecastTemp[0].textContent=`${this.getAverageForecastTempFirstIndex(weatherData,currentIndex)}°C`;
      this.forecastTempDays[0].innerHTML=`<i class="fa-solid fa-temperature-arrow-up"></i> 
      ${this.getMaxTempForFirstIndex(weatherData,currentIndex)}°C`;
      this.forecastMinTemp[0].innerHTML=`<i class="fa-solid fa-temperature-arrow-down"></i>
      ${this.getMinTempForFirstIndex(weatherData,currentIndex)}°C`;
      for(let index=1;index<5;index++){
         this.forecastDateDays[0].textContent="Today";
         if(currentIndex<40){
            this.get5DaysForecastIcon(weatherData,currentIndex,index);
            this.averageForecastTemp[index].textContent=`${this.getAverageForecastTemp(weatherData,currentIndex)}°C`;
            this.forecastTempDays[index].innerHTML=`<i class="fa-solid fa-temperature-arrow-up"></i>
            ${this.get5DaysTemp(weatherData,currentIndex)}°C`;
            this.forecastMinTemp[index].innerHTML=`<i class="fa-solid fa-temperature-arrow-down"></i>
            ${this.getMinForecastTemp(weatherData,currentIndex)}°C`;
            this.forecastDateDays[index].textContent=`${this.getForecastDate()} ${this.getForecastDay(weatherData,currentIndex)}
             ${this.getForecastMonth(weatherData,currentIndex)}`;
            currentIndex=currentIndex+8; 
         }
      }
   }

   getAverageForecastTempFirstIndex(weatherData,currentIndex){
      let sum=0;
      let count=0;
      for(let i=0;i<currentIndex;i++){
         sum=sum+weatherData.list[i].main.temp;
         count++;
      }
      return (sum/count).toFixed(0);
   }

   getAverageForecastTemp(weatherData,currentIndex){
      let sum=0;
      let count=0;
      for(let i=currentIndex;i<currentIndex+8;i++){
         sum=sum+weatherData.list[i].main.temp;
         count++;
      }
      return (sum/count).toFixed(0);
   }

   getMaxTempForFirstIndex(weatherData,currentIndex){
      let max=weatherData.list[0].main.temp;
      for(let i=0;i<currentIndex;i++){
         if(max<weatherData.list[i].main.temp)
            max=weatherData.list[i].main.temp;
      }
      return max.toFixed(0);
   }

   getMinTempForFirstIndex(weatherData,currentIndex){
      let min=weatherData.list[0].main.temp;
      for(let i=0;i<currentIndex;i++){
         if(min>weatherData.list[i].main.temp){
            min=weatherData.list[i].main.temp;
         }
      }
      return min.toFixed(0);
   }

   get5DaysTemp(weatherData,currentIndex){
      let max=weatherData.list[currentIndex].main.temp;
      for(let i=currentIndex;i<currentIndex+8;i++){
         if(i<40){
         if(weatherData.list[i].main.temp>max)
            max=weatherData.list[i].main.temp;
      }
   }
      return max.toFixed(0);
   }

   getMinForecastTemp(weatherData,currentIndex)
   {
      let minTemp=weatherData.list[currentIndex].main.temp;
      for(let i=currentIndex;i<currentIndex+8;i++){
         if(weatherData.list[i].main.temp<minTemp)
            minTemp=weatherData.list[i].main.temp;
      }
      return minTemp.toFixed(0);
   }

   getForecastDate(){
      const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
      this.forecastDays++;
      if(this.forecastDays===8)
         this.forecastDays=1;
      return days[this.forecastDays-1];
   }

   getForecastDay(weatherData,currentIndex){
      const forecastDay=weatherData.list[currentIndex].dt_txt;
      return forecastDay.slice(forecastDay.lastIndexOf("-")+1,forecastDay.indexOf(" ")).trim();
   }

   getForecastMonth(weatherData,currentIndex){
      const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const forecastMonth=weatherData.list[currentIndex].dt_txt;
      return months[(forecastMonth.slice(forecastMonth.indexOf("-")+2,forecastMonth.lastIndexOf("-")))-1];
   }

   getCurrentIndex(weatherData){
      let currentIndex;
      let time=weatherData.list[0].dt_txt;
      time=time.slice(time.indexOf(" "));
      time=time.trim();
      if(time===`18:00:00`){
            currentIndex=2;
         }else if(time===`21:00:00`){
            currentIndex=1;
         }else if(time===`00:00:00`){
            currentIndex=8;
         }else if(time===`03:00:00`){
            currentIndex=7;
         }else if(time===`06:00:00`){
            currentIndex=6;
         }else if(time===`09:00:00`)
            currentIndex=5;
         else if(time===`12:00:00`)
            currentIndex=4;
         else if(time===`15:00:00`)
            currentIndex=3;
         return currentIndex;
   }

   get5DaysForecastIcon(weatherData,currentIndex,i){
         if(weatherData.list[currentIndex].weather[0].main===`Clouds`){
              this.forecastIconDays[i].textContent="☁️";
         }else if(weatherData.list[currentIndex].weather[0].main===`Rain`){
              this.forecastIconDays[i].textContent="🌧️";
        }else if(weatherData.list[currentIndex].weather[0].main===`Clear`){
             this.forecastIconDays[i].textContent="☀️";
        }else if(weatherData.list[currentIndex].weather[0].main===`Snow`){
            this.forecastIconDays[i].textContent="❄️";
        }else if(weatherData.list[currentIndex].weather[0].main==='Thunderstorm')
            this.forecastIconDays[i].textContent="⛈️";
        else if(weatherData.list[currentIndex].weather[0].main==='Drizzle'){
            this.forecastIconDays[i].textContent="🌦️";
        }else if(weatherData.list[currentIndex].weather[0].main==='Mist')
            this.forecastIconDays[i].textContent="🌫️";
        else
          this.forecastIconDays[i].textContent="🌫️"; 
   }
}

new WeatherApp();
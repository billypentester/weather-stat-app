const axios = require('axios')
const express = require('express')
const path = require('path')
const hbs = require('hbs')
const app = express()

const port = 3000 || process.env.PORT
const staticweb = path.join(__dirname, "/public");
const tempweb = path.join(__dirname, "/temp/views/")
const partial = path.join(__dirname, "/temp/partials")

app.use('/public',express.static(staticweb))
hbs.registerPartials(partial)
app.set('views', tempweb);
app.set("view engine", "hbs")

app.get('/', (req, res) => {
    res.render("main")
})

app.get('/index', (req, res) => {

    // get peremeter
    const cn = req.query.find

    if(cn)
    {
            //apis 
            const weather = "https://api.openweathermap.org/data/2.5/weather?q=" + cn + "&appid=18a518b0604c5f30de4c7bb3ed47af26"
            const pic = "https://api.unsplash.com/search/photos?query=" + cn  + "&client_id=wk2i8uI-Uq5RqBEjGKuIWl4S4UncvUfn0Ed6wIwGJYg&orientation=landscape"
            const forecast = "https://api.openweathermap.org/data/2.5/forecast/?q="+ cn + "&APPID=18a518b0604c5f30de4c7bb3ed47af26"

            var today = new Date()

            var cyear = "0" + today.getFullYear()

            var cmonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

            var hours = today.getHours()

            function webicon(hours)
            {
                var icon =  null;
                var greeting =  null;
                var backcol = null;

                var card = {};

                if(hours>=5 && hours<7)
                {
                return (card = { 
                    icon : "./../../public/icons/dawn.png",
                    greeting : "Good morning",
                    backcol : "colo"
                    })  
                }
                else if(hours>=7 && hours<12)
                {
                    return (card = { 
                        icon : "./../../public/icons/morning.png",
                        greeting : "Good morning",
                        backcol : "colo"
                    })  
                }
                else if(hours>=12 && hours<16)
                {
                    return (card = { 
                        icon : "./../../public/icons/afternoon.png",
                        greeting : "Good afternoon",
                        backcol : "colo2"
                    })  
                }
                else if(hours>=16 && hours<19)
                {
                    return (card = { 
                        icon : "./../../public/icons/evening.png",
                        greeting : "Good evening",
                        backcol : "colo3"
                    }) 
                }
                else
                {
                    return (card = { 
                        icon : "./../../public/icons/night.png",
                        greeting : "Good night",
                        backcol : "colo4"
                    })
                }
            }

            function formatAMPM(date) {
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                minutes = minutes < 10 ? '0'+minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                return strTime;
            }

            var dateobj = {
                year : cyear.substr(-2),
                month : cmonth[today.getMonth()],
                date : today.getDate(),
                name : days[today.getDay()],
                time : formatAMPM(today),
                webicons : webicon(hours)
            }

            //api calls
            const requestOne = axios.get(weather);
            const requestTwo = axios.get(pic);
            const requestThree = axios.get(forecast);

            axios
            .all([requestOne, requestTwo, requestThree])
            .then(
                axios.spread((...responses) => {
                const tempdata = responses[0].data;
                const picdata = responses[1].data;
                const forecastdata = responses[2].data;

                let unix_sunrise = tempdata.sys.sunrise;
                let unix_sunset = tempdata.sys.sunset;

                // sunrise
                var date_sunrise = new Date(unix_sunrise * 1000);
                var hours_sunrise = date_sunrise.getHours();
                var minutes_sunrise = "0" + date_sunrise.getMinutes();
                var sunrise = [hours_sunrise,minutes_sunrise.substr(-2)]

                var finalrise = sunrise[0] + ":" +sunrise[1] + " AM"

                // sunset
                var date_sunset = new Date(unix_sunset * 1000);
                var hours_sunset = date_sunset.getHours();
                var minutes_sunset = "0" + date_sunset.getMinutes();
                var sunset = [hours_sunset,minutes_sunset.substr(-2)] 

                var finalset = (sunset[0]-12) + ":" +sunset[1] + " PM"

                const intNumber = Math.floor(Math.random() * (4 - 0)) + 0;

                const rpic = [
                    picdata.results[0].urls.regular,
                    picdata.results[1].urls.regular,
                    picdata.results[2].urls.regular,
                    picdata.results[3].urls.regular,
                    picdata.results[4].urls.regular,
                ]

                var icon = []
                var tstamp = []
                var desp = []
                var dstamp = []
                var weekday = [];
                var newday = [];

                function formatstamp(date) {
                    var hours = date.slice(0,2);
                    var minutes = date.slice(3,5);
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    // minutes = minutes < 10 ? '0'+ minutes : minutes;
                    var strTime = hours + ':' + minutes + ' ' + ampm;
                    return strTime;
                }

                for(i=0;i<40;i++)
                {
                    icon[i] = forecastdata.list[i].weather[0].icon;
                    desp[i] = forecastdata.list[i].weather[0].description;
                    tstamp[i] = formatstamp(forecastdata.list[i].dt_txt.slice(-8,-3));
                    dstamp[i] =  forecastdata.list[i].dt_txt.slice(0,10)
                    newday[i] = new Date(dstamp[i])
                    weekday[i] = days[newday[i].getDay()]
                }


                //temp object
                const rtemp = { 
                    temp : Math.round(tempdata.main.temp - 273.15),
                    feels : Math.round(tempdata.main.feels_like - 273.15),
                    condition : tempdata.weather[0].description,
                    icon : tempdata.weather[0].icon,
                    humidity : tempdata.main.humidity,
                    temp_min : Math.round(tempdata.main.temp_min - 273.15),
                    temp_max : Math.round(tempdata.main.temp_max - 273.15),
                    city : tempdata.name,
                    sunrise : finalrise,
                    sunset : finalset,
                    wind : tempdata.wind.speed,
                    date : dateobj,
                    pic : rpic[intNumber],
                    icons : icon,
                    time : tstamp,
                    dstamp : weekday,
                    status : desp
                }

                res.render("index", rtemp)

                })
            )
        .catch(errors => {
            res.render("error", {
                name : cn
            })
        });
    }
    else
    {
        res.render("main")
    }
})

app.get('/github.com/billypentester', (req, res) => {
    res.redirect('https://github.com/billypentester');
})




app.listen(port, () => {
    console.log(`app is running on port : ${port}`)
})
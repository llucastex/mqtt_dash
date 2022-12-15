import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAt1ifFrPSjjC2PS6EO69vWiLA2o2qZTc0",
    authDomain: "clp-teste.firebaseapp.com",
    projectId: "clp-teste",
    storageBucket: "clp-teste.appspot.com",
    messagingSenderId: "30384936745",
    appId: "1:30384936745:web:df8f75de48c304eb7b4938"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const parag_x = document.getElementById('t1')
const parag_y = document.getElementById('t2')
const parag_z = document.getElementById('t3')
const button = document.getElementById('button')
button.addEventListener("click", () => {
    update(ref(database, 'estado'), {
        off: 0,
        on: 1,
      })
});

// Assim que um dado for atualizado no banco de dados, atualiza valores no HTML
onValue(ref(database, 'dados'), (snapshot) => {
    const data = snapshot.val();
    let x_values = trataJson(data)[0];
    let y_values = trataJson(data)[1];
    let z_values = trataJson(data)[2];
    let date_now = trataJson(data)[3];
    date_now = date_now[date_now.length-1];
    let msg = date_now.split('/')
    let newDate = `${msg[0]}/${msg[1]}`
    parag_x.innerText = `O ultimo valor lido foi x: ${x_values[x_values.length-1]}ms²`;
    parag_y.innerText = `O ultimo valor lido foi y: ${y_values[y_values.length-1]}ms²`;
    parag_z.innerText = `O ultimo valor lido foi z: ${z_values[z_values.length-1]}ms²`;
    myChart.data.datasets[0].data.push(x_values[x_values.length-1]);
    myChart.data.datasets[1].data.push(y_values[y_values.length-1]);
    myChart.data.datasets[2].data.push(z_values[z_values.length-1]);
    myChart.data.labels.push(newDate)
    myChart.update();
  });

// Função que trata dados recebidos do banco de dados
function trataJson(data){
    let valuesArray = Object.values(data);
    let trata_time = e => {return Object.values(e)[0]}
    let trata_x = e => {return Object.values(e)[1]}
    let trata_y = e => {return Object.values(e)[2]}
    let trata_z = e => {return Object.values(e)[3]}
    let actualTime = valuesArray.map(trata_time)
    let x_values = valuesArray.map(trata_x)
    let y_values = valuesArray.map(trata_y)
    let z_values = valuesArray.map(trata_z)
    return [x_values, y_values, z_values, actualTime]
}


// Gerar gráfico com os dados obtidos do banco de dados
let ylabels_1 = []
let ylabels_2 = []
let ylabels_3 = []
let xlabels = []
const ctx = document.getElementsByClassName('line-chart');
const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xlabels.reverse(),
                datasets: [{
                    label: 'X data',
                    data: ylabels_1.reverse(),
                    backgroundColor: [
                        'transparent',
                    ],
                    borderColor: [
                        'rgb(186, 0, 0)',
                    ],
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        // above: 'rgb(102, 255, 102)',   // Area will be red above the origin
                        // below: 'rgb(8, 79, 28)'    // And blue below the origin
                        },
                    pointRadius: 0,
                },
                {
                    label: 'Y data',
                    data: ylabels_2.reverse(),
                    backgroundColor: [
                        'transparent',
                    ],
                    borderColor: [
                        'rgb(0, 204, 0)',
                    ],
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        // above: 'rgb(8, 79, 28)',   // Area will be red above the origin
                        // below: 'rgb(8, 79, 28)'    // And blue below the origin
                        },
                    pointRadius: 0,
                },
                {
                    label: 'Z data',
                    data: ylabels_3.reverse(),
                    backgroundColor: [
                        'transparent',
                    ],
                    borderColor: [
                        'rgb(0, 0, 200)',
                    ],
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        // above: 'rgb(8, 79, 28)',   // Area will be red above the origin
                        // below: 'rgb(8, 79, 28)'    // And blue below the origin
                        },
                    pointRadius: 0,
                }
            ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks:{
                            callback: function(value, index, values) {
                                return value;
                            }
                        }
                    },
                    x:{
                        ticks:{
                        }
                    }
                }
            }
            });

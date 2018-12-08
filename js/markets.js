var pair = getUrlParameter( "currency" );
buildData(pair);

$( document ).ready( function() {
    $(".chosen-select").chosen( { width: "100%" } );

    $( '.chosen-select').change(function(){
        var url = window.location.href.split( '?' )[0];

        if( $( "#currency" ).val() !== 'Select' ) {
            url += "?currency=" + encodeURIComponent( $( "#currency" ).val() );
        }

        window.location.href = url;
    });
});

function getUrlParameter( requestedParam ) {
    var queryString = decodeURIComponent( window.location.search.substring(1) );
    var queryVars = queryString.split('&');
    var queryParam = "";

    for( var i = 0; i < queryVars.length; i++ ) {
        queryParam = queryVars[i].split( '=' );

        if ( queryParam[0] === requestedParam ) {
            return queryParam[1];
        }
    }
};

function buildTicker( pair, print ){
    if( pair ) {
        var ticker = '';
        if( pair !== 'btc' ){
            ticker = pair.replace( "btc", '' ).replace( "_", '' );
        } else if( print === false ) {
            return '';
        }
        return ticker.toUpperCase();
    }
}

function buildChartTitle( valueFinal, pair ) {
    if( pair !== 'btc' ) {
        var suffix = '';
        suffix = ' <span class="currency-pair">' + buildTicker( pair ) + '</span>';
        if( !pair.startsWith( "btc" ) ) {
            valueFinal = Math.round( ( 1 / valueFinal ) * 100 ) / 100;
        }
        return '<span class="btc-note">1 BTC</span>' + '<span class="price">' + valueFinal + '</span>' + suffix;
    } else {
        return '<span class="btc-note">Volume and</span>' + '<span class="price">Trades</span>';
    }
}

//keep all numbers to constant significant figures
function roundToSigFigs( num ) {

    var precision = 0;
    num = parseFloat( num );

    if( num < parseFloat( .1 ) ) {
        precision = Math.floor( Math.log10( num ) ) + 1;
        return num.toPrecision( 5 + precision );
    } else {
        precision = Math.floor( Math.log10( num/.0001 ) ) - 1;
        return num.toPrecision( precision );
    }
}

//fill table
function getTrades( pair ) {

    var actionTicker = buildTicker( pair );
    var jsonUrl = '';
    var tradeDate = '';
    var dateFormat = "mmm d, yyyy - HH:MM:ss";

    if( !pair || pair === 'all' ) {

        pair = 'all';
        jsonUrl = 'https://markets.bisq.network/api/trades?market=all&format=jsonpretty';

        $.get( jsonUrl, function( data ) {


            $( '<tr>' ).append(
                $( '<th>' ).text( 'Date' ),
                $( '<th>' ).text( 'Action' ),
                $( '<th>' ).text( 'Price' ),
                $( '<th>' ).text( 'Amount in BTC' ),
                $( '<th>' ).text( 'Trade Amount')
            ).appendTo( '#trade-history-header' );

            data = JSON.parse(data); console.log( data );
            $.each( data, function( key, val ) {

                tradeDate = new Date( val.trade_date );

                $( '<tr>' ).append(
                    $( '<td>' ).html( tradeDate.format( dateFormat ) ),
                    $( '<td>' ).text( val.direction + ' ' + buildTicker( val.market ) ),
                    $( '<td>' ).text( roundToSigFigs( val.price ) + ( val.payment_method === 'BLOCK_CHAINS' ? ' BTC' : ' ' + buildTicker( val.market ) ) ),
                    $( '<td>' ).text( ( val.payment_method === 'BLOCK_CHAINS' ? '—' : roundToSigFigs( val.amount ) ) ),
                    $( '<td>' ).text( roundToSigFigs( val.volume ) + ' ' + buildTicker( val.market ) )
                ).appendTo( '#trade-history-body' );

            });

        });

    } else{


                  jsonUrl = 'https://markets.bisq.network/api/trades?market='+pair;
                  //jsonUrl = baseUrl+'/js/sample_data/trades_'+pair+'.json';

                  console.log(jsonUrl);


                  $.get( jsonUrl, function( data ) {


                    $( '#offers').show();

                    if(pair.startsWith("btc")){
                      $( '<tr>' ).append(
                          $( '<th>' ).text( 'Date' ),
                          $( '<th>' ).text( 'Action' ),
                          $( '<th>' ).text( 'Price ('+buildTicker(pair)+')' ),
                          $( '<th>' ).text( 'Trade Size (BTC)' ),
                          $( '<th>' ).text( 'Trade Size ('+buildTicker(pair)+')')
                        ).appendTo('#trade-history-header');

                    }else{
                      $( '<tr>' ).append(
                          $( '<th>' ).text( 'Date' ),
                          $( '<th>' ).text( 'Action' ),
                          $( '<th>' ).text( 'Price (BTC)' ),
                          $( '<th>' ).text( 'Trade Size ('+buildTicker(pair)+')' ),
                          $( '<th>' ).text( 'Trade Size (BTC)')
                      ).appendTo('#trade-history-header');
                    }


                    $.each( JSON.parse(data) , function( key, val ) {
                        /*
                        amount: "0.03260000"
                        direction: "SELL"
                        market: "btc_usd"
                        payment_method: "CLEAR_X_CHANGE"
                        price: "7058.66910000"
                        trade_date: 1539908123775
                        trade_id: "FYFTP-ba7cb6c2-7a40-4b91-9a70-003ed8823585-080"
                        volume: "230.11260000"
                        */

                        tradeDate = new Date(val.trade_date);

                        $( '<tr>' ).append(
                            $( '<td>' ).text(tradeDate.format(dateFormat)),
                            $( '<td>' ).text(val.direction + ' ' + actionTicker),
                            $( '<td>' ).text( parseFloat(val.price)),
                            $( '<td>' ).text( parseFloat(val.amount)),
                            $( '<td>' ).text( parseFloat(val.volume))
                        ).appendTo('#trade-history-body');

                    });

                  });

    }

}











function getOffers(pair){

  if(pair == undefined || pair === 'all'){
    pair = 'all';
  }

  var volTotal = 0;

  var jsonUrl = 'https://markets.bisq.network/api/offers?market='+pair+'&format=jsonpretty';
  //jsonUrl = baseUrl+'/js/sample_data/offers_'+pair+'.json';

  console.log(jsonUrl);

      $.getJSON( jsonUrl, function( data ) {


        if(pair.startsWith("btc")){
          $( '<tr>' ).append(
              $( '<th>' ).text( 'Price' ),
              $( '<th>' ).text( 'BTC' ),
              $( '<th>' ).text(buildTicker(pair)),
              $( '<th>' ).text( 'Sum ('+buildTicker(pair)+')' ),
            ).appendTo('#buy-offers-header');
            $( '<tr>' ).append(
                $( '<th>' ).text( 'Price' ),
                $( '<th>' ).text( 'BTC' ),
                $( '<th>' ).text(buildTicker(pair)),
                $( '<th>' ).text( 'Sum ('+buildTicker(pair)+')' ),
            ).appendTo('#sell-offers-header');
        }else{
            $( '<tr>' ).append(
              $( '<th>' ).text( 'Price' ),
              $( '<th>' ).text(buildTicker(pair)),
              $( '<th>' ).text( 'BTC' ),
              $( '<th>' ).text( 'Sum (BTC)' ),
            ).appendTo('#buy-offers-header');
            $( '<tr>' ).append(
              $( '<th>' ).text( 'Price' ),
              $( '<th>' ).text(buildTicker(pair)),
              $( '<th>' ).text( 'BTC' ),
              $( '<th>' ).text( 'Sum (BTC)' ),
            ).appendTo('#sell-offers-header');
        }


        $.each( data[pair].buys, function( key, val ) {
          volTotal = parseFloat(volTotal) + parseFloat(val.volume);
          $( '<tr>' ).append(
              $( '<td>' ).text( parseFloat(val.price)),
              $( '<td>' ).text( parseFloat(val.amount)),
              $( '<td>' ).text( parseFloat(val.volume)),
              $( '<td>' ).text(volTotal)
          ).appendTo('#buy-offers-body');

        });

        $.each( data[pair].sells, function( key, val ) {
          volTotal = parseFloat(volTotal) + parseFloat(val.volume);
          $( '<tr>' ).append(
              $( '<td>' ).text( parseFloat(val.price)),
              $( '<td>' ).text( parseFloat(val.amount)),
              $( '<td>' ).text( parseFloat(val.volume)),
              $( '<td>' ).text(volTotal)
            ).appendTo('#sell-offers-body');
        });

        $( '#offers').show();

    });

}




function buildData(jsonUrl){


    if(pair == undefined || pair === 'all'){
      //api/volumes?basecurrency=BTC&milliseconds=true&timestamp=no&format=jscallback&fillgaps=
      pair = 'btc';

      jsonUrl = "https://markets.bisq.network/api/volumes?basecurrency=btc&milliseconds=true&timestamp=no&format=jscallback&fillgaps=&callback=?&interval=day";
      //console.log("chart volumes: " + pair);
      getTrades('all');

    }else{
      var jsonUrl = 'https://markets.bisq.network/api/hloc'+'?market='+pair+'&timestamp=no'+'&interval=minute'+'&timestamp_from='+'&timestamp_to='+'&format=jscallback'+'&callback=?';
      console.log("chart hloc: " + pair);
      getTrades(pair);
      getOffers(pair);
    }

    $.getJSON(jsonUrl, function (data) {


        // split the data set into ohlc and volume
        var
            //ohlc = [],
            seriesTitle1 = 'Price',
            avg = [],
            volume = [],
            dataLength = data.length,
            // set the allowed units for data grouping
            groupingUnits = [[
                'week',                         // unit name
                [1]                             // allowed multiples
            ], [
                'month',
                [1, 2, 3, 4, 6]
            ]],

            i = 0;




        for (i; i < dataLength; i += 1) {
            /*
            ohlc.push([
                data[i][0], // the date
                data[i][1], // open
                data[i][2], // high
                data[i][3], // low
                data[i][4] // close
            ]);
            */

            if(pair === 'btc'){

                    avg.push([
                        data[i][0], // the date
                        data[i][2]  // the num of trades
                    ]);

                    volume.push([
                        data[i][0], // the date
                        data[i][1]  // the volume_right
                    ]);

                    seriesTitle1 = 'Num of trades';

            }else{
                    if(pair.startsWith("btc")){
                      avg.push([
                          data[i][0]*1000, // the date
                          data[i][7]  // the average
                      ]);
                    }else{
                      avg.push([
                          data[i][0]*1000, // the date
                          (1 / data[i][7])  // the average
                      ]);
                    }
                    volume.push([
                        data[i][0]*1000, // the date
                        data[i][6]  // the volume_right
                    ]);
              }
        }



        Highcharts.setOptions({
          lang: {
                  rangeSelectorZoom: ''
              }
        });
        // create the chart
        Highcharts.stockChart('container', {

            rangeSelector: {
                selected: 5,
                inputEnabled: false,
                buttonPosition: {
                		align: 'right',
                		x: 0,
                		y: -60
                },
                buttonTheme: { // styles for the buttons
                    width: 22,
                    height: 17,
                    fill: 'none',
                    stroke: 'none',
                    'stroke-width': 0,
                    r: 2,
                    style: {
                        color: '#25B135',
                        fontWeight: '300',
                        fontFamily: 'IBM Plex Sans',
                        fontSize:'14px',
                    },
                    states: {
                        hover: {
                        },
                        select: {
                            fill: '#25B135',
                            style: {
                                fontWeight: '300',
                                color: 'white'
                            }
                        }
                        // disabled: { ... }
                    }
                },
                buttons: [

                {
                    type: 'hour',
                    count: 1,
                    text: '1H'
                },

                {
                    type: 'day',
                    count: 1,
                    text: '1D'
                }, {
                    type: 'week',
                    count: 1,
                    text: '1W'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1M'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1Y'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },


            chart: {
                margin: [0,0,45,0],
                //backgroundColor: '#bbb',
                backgroundColor:'rgba(255, 255, 255, 0.0)'
            },

            plotOptions: {
                series: {
                    //animation: false
                    //stickyTracking: true,
                },
                series: {
                    //pointWidth: 15
                }
            },

            title: {
                text: buildChartTitle(data[dataLength-1][7], pair),
                align: 'left',
                x:20,
                y:30,
                useHTML: true,
                style: { zIndex: 0, },
            },






            navigator: {
                enabled: false
            },
            exporting: {
              enabled: false
            },
            credits: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },

            dataGrouping: {
                enabled: true,
                forced: true,
                units: [
                    ['month', [1, 3, 6]]
                ]
            },

            yAxis: [
                    {
                      labels: {
                          align: 'right',
                          x: -18,
                          y: -5,
                          style: {
                              color: '#25B135',
                              fontWeight: '300',
                              fontFamily: 'IBM Plex Sans',
                              fontSize: '10',
                          }
                          //enabled: false
                      },
                      style: {
                          color: '#FF00FF',
                          fontWeight: 'bold'
                      },
                      gridLineColor: 'transparent',
                      //visible: false,
                      title: {
                          text: 'Price'
                      },
                      height: '100%',
                      lineWidth: 0,
                      top: '0%',
                      //resize: { enabled: true }
                    },


                    {
                        labels: {
                            y: -5,
                            x: -48,
                            //align: 'left',
                            //x: -140,
                            //enabled: false,
                            style: {
                                color: '#9c9c9c',
                                fontWeight: '300',
                                fontFamily: 'IBM Plex Sans',
                                fontSize: '10',
                            },
                        },
                        opposite: true,
                        //visible: false,

                        title: {
                            text: 'Volume'
                        },
                        top: '0%',
                        //height: '35%',
                        gridLineColor: 'transparent',
                        offset: 0,
                        lineWidth: 0,
                        height: '100%'
                    }

              ],


              xAxis: [
                      {
                        labels: {
                            style: {
                              color: '#92d799',
                              fontWeight: '300',
                              fontFamily: 'IBM Plex Sans',
                              fontSize: '14',
                            },
                        },
                        gridLineColor: 'transparent',
                        lineWidth: 0,
                        //resize: { enabled: true }
                        offset: 8,
                        tickLength: 0,
                        tickWidth: 0,
                        zIndex: -5,
                        backgroundColor: '#bbb',
                      },



                ],





            series: [

              {
                  type: 'area',
                  type: 'line',
                  name: seriesTitle1,
                  tooltip: {
                      valueSuffix: ' '+buildTicker(pair, false)
                  },
                  data: avg,
                  yAxis: 1,
                  color: '#25B135',
                  getExtremesFromAll:false,
                  fillOpacity: 0.6,
                  yAxis: 0,
                  zIndex: 1,
                  lineWidth: 1

              },



              {
                  type: 'column',
                  name: 'Volume',
                  tooltip: {
                      valueSuffix: ' ' + buildTicker(pair)
                  },
                  data: volume,
                  color: '#bbb',
                  states: { hover: { color: '#aaa', duration: 0 } },
                  yAxis: 1,
                  zIndex: -10,
                  maxPointWidth: 200,
                  pointPadding: 0,
                  groupPadding: 0,
                  borderWidth: 0,
                  shadow: false,
                  borderColor: '#c5c5c5',
                  dataGrouping: {
                      groupAll: true
                  }

              },





          ],

          tooltip: {
              followPointer: false,
              split: false,
              crosshairs: true,
              shared: true,
              useHTML: true,
              headerFormat: '<small>{point.key}</small><table>',
              pointFormat: '<tr style="color: {series.color}" ><td>{series.name}: </td>' + '<td style="text-align: right"> <b>{point.y} {this.series.tooltipOptions.valueSuffix}</b></td></tr>',
              footerFormat: '</table>',
              valueDecimals: 2,
              borderRadius: 0,
              borderWidth: 0,
              //animation: false,
              borderRadius: 2,
              shadow: false,
              backgroundColor: "rgba(246,246,246,1)",
              style: {
                  color: '#444',
                  fontWeight: '300',
                  fontFamily: 'IBM Plex Sans',
                  width: 400,
                  zIndex: 19999,
              },

          },

        });
    });

}

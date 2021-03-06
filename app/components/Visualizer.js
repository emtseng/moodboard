import React, { Component } from 'react'
import { VictoryChart, VictoryTheme, VictoryVoronoiContainer, VictoryAxis, VictoryScatter, VictoryLine, VictoryTooltip } from 'victory'
import $ from 'jquery'

/* ----- COMPONENT ----- */

class Visualizer extends Component {
  docLength = (arr) => {
    let max = 0
    arr.forEach(obj => {
      if (obj.x > max) max = obj.x
    })
    return max
  }
  domainX = () => {
    return [-1, this.docLength(this.props.data.sentences)]
  }
  domain = () => {
    return {
      x: this.props.data.sentences ? this.domainX() : [-1, 10],
      y: [-1, 1]
    }
  }
  render() {
    return (
      <div id="vizBlock">
        <div id="vizTitle">
          <h2>VISUALIZER</h2>
          <p>This is a sentimentagram showing the progression of lyrical sentiment over time in {this.props.currSong || 'your song'}.</p>
          <p>Hover over a dot to see the line that generated it, and what Google thinks of its sentiment.</p>
        </div>
        {
          this.props.currSong ? (
                    <div id="vizChart">
          <VictoryChart
            domainPadding={5}
            theme={VictoryTheme.material}
            width={this.props.chartWidth}
            height={this.props.chartHeight}
            margin={{ top: 0, bottom: 0, left: 80, right: 40 }}
            padding={{ top: 20, bottom: 20, left: 30, right: 30 }}
            containerComponent={<VictoryVoronoiContainer responsive={false} />}
            domain={this.domain()}
            animate={{ duration: 500 }}
          >
            <VictoryAxis
              label="Progression"
              style={{
                axis: { stroke: "#756f6a" },
                axisLabel: { fontSize: 10, padding: 60 },
                ticks: { stroke: "grey" },
                tickLabels: { fontSize: 10, padding: 5 }
              }}
            />
            <VictoryAxis
              dependentAxis
              label="Sentiment"
              tickFormat={tick => {
                const domainStartAndEnd = this.domain().y
                if (domainStartAndEnd.indexOf(tick) > -1) {
                  return tick === -1 ? '-1 (neg)' : '1 (pos)'
                } else {
                  return tick
                }
              }}
              style={{
                axis: { stroke: "#756f6a" },
                axisLabel: { fontSize: 10, padding: 40 },
                ticks: { stroke: "grey" },
                tickLabels: { fontSize: 10, padding: 5 }
              }}
            />
            <VictoryScatter
              data={this.props.data.sentences && this.props.data.sentences}
              size={(datum, active) => active ? 5 : 3}
            />
            <VictoryLine
              data={this.props.data.sentences && this.props.data.sentences}
              labels={datum => `'${datum.sentence}' \n ${datum.y}`}
              labelComponent={
                <VictoryTooltip
                  cornerRadius={1}
                  style={{
                    fontSize: 20,
                    padding: 5,
                    fill: '#FFFFFF'
                  }}
                  flyoutStyle={{
                    stroke: 'none',
                    fill: '#9A393C'
                  }}
                />
              }
              interpolation="basis"
            />
          </VictoryChart>
        </div>
          ) : null
        }
      </div>
    )
  }
}

/* ----- CONTAINER ----- */

import { connect } from 'react-redux'

const mapStateToProps = (store, ownProps) => ({
  currSong: store.currSong,
  data: store.data,
  corpus: store.corpus,
  chartWidth: $(window).width() * .75,
  chartHeight: $(window).height() * .40
})

export default connect(mapStateToProps)(Visualizer)

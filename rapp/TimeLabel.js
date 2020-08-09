import * as React from "react"

function tfmt(n) {
  if (!(n >= 0 && n <= 99)) return "??"
  n = Math.floor(n)
  return (n < 10 ? "0" : "") + n
}

export const TimeLabel = (props) => {
  const t = props.time;
  return (
    <div className="TimeLabel">
      <span className="label">Day</span> <span className="dayValue">{(!!t && t.day) || 0}</span>
      <span>&nbsp;</span>
      { !!t && <span className="timeValue">{tfmt(t.hour)}:{tfmt(t.minute)}:{tfmt(t.second)}</span> }
    </div>
  )
}

export default TimeLabel;

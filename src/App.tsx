import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Moment from 'react-moment';
import moment from 'moment';
import formatDuration from './duration';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SocialIcon } from 'react-social-icons';


function App() {
  const [params, setParams] = useSearchParams();
  const interval = (params.get("initialInterval"))
  const maxInterval = (params.get("maxInterval"))
  const maxReties = (params.get("maxReties"))
  const backOffCoeficient = (params.get("backoffCoeificent"))
  const [config, setConfig] = useState<ICalcProps>({ initialInterval: interval, maxInterval: maxInterval, maxReties: maxReties, backoffCoeificent: backOffCoeficient });


  useEffect(() => {
    let nonNullData = Object.entries(config).filter((v) => v[1] != null)
    let newParam = new URLSearchParams(nonNullData)
    setParams(newParam)
  }, [config])

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <NumberInput value={config.initialInterval} header='Initial Interval (seconds)' onChange={(value: string) => {
          setConfig({ ...config, initialInterval: (value) })
        }} />
        <NumberInput value={config.maxInterval} header='Max Interval (seconds)' onChange={(value: string) => {
          setConfig({ ...config, maxInterval: (value) })
        }} />
        <NumberInput value={config.maxReties} header='Max Retries' onChange={(value: string) => {
          setConfig({ ...config, maxReties: (value) })
        }} />
        <NumberInput value={config.backoffCoeificent} header='Back off coeficient' onChange={(value: string) => {
          setConfig({ ...config, backoffCoeificent: (value) })
        }} />
      </div>
      <ShowCalculations {...config} />
      <div style={{ display: 'inline-block', position: 'fixed', right: '10px', bottom: '10px' }}>
        <SocialIcon target='_blank' style={{ marginRight: '5px' }} url="https://github.com/ManuverGujjar/temporal-retry-calculator" />
      </div>
    </div>
  );
}

function NumberInput({ value, header, onChange }: { value: string | number | null, header: string, onChange: (value: string) => void }) {
  return <div className="mb-3 row">
    <label className="col-sm-2 col-form-label">{header}</label>
    <div className="col-sm-10">
      <input value={String(value)} type='number' className='form-control' onChange={(a) => { onChange(a.currentTarget.value) }}></input>
    </div>
  </div>
}

interface ICalcProps {
  initialInterval: string | null
  maxInterval: string | null,
  maxReties: string | null,
  backoffCoeificent: string | null
}

interface CalcTime {
  currentSeconds: number,
  deltaSeconds: number
}

function ShowCalculations(props: ICalcProps) {
  var reties: CalcTime[] = [];

  let currentInt = Number(props.initialInterval);
  let currentTime = currentInt;
  reties.push({ currentSeconds: currentInt, deltaSeconds: 0 })
  for (let i = 0; i < Number(props.maxReties) - 1; i++) {
    currentInt = currentInt * Number(props.backoffCoeificent);
    if (currentInt > Number(props.maxInterval)) currentInt = Number(props.maxInterval);
    currentTime += currentInt;
    reties.push({ currentSeconds: currentTime, deltaSeconds: currentInt });
  }

  return (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '20px' }}> Last Attempt Time: {formatDuration((reties[reties.length - 1]?.currentSeconds ?? 0) * 1000)} </div>
      <table className='table' >
        <thead>
          <th>Attempt</th>
          <th>Retrying Time</th>
          <th>Delta from Previous</th>
        </thead>
        {reties.map((r, i) => {
          return <TimelineItem index={i + 1} seconds={r.currentSeconds} deltaSeconds={r.deltaSeconds} />
        })}
      </table>
    </div>
  );
}

function TimelineItem({ index, seconds, deltaSeconds }: { index: number, seconds: number, deltaSeconds: number }) {
  return (
    <tr>
      <td>{index}</td>
      <td className='table-primary'>{formatDuration(seconds * 1000)}</td>
      <td>{formatDuration(deltaSeconds * 1000)} </td>
    </tr>
  );
}


export default App;

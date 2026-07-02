import React from "react";
import { COLORS, FONT_BODY, FONT_MONO, SET_META } from "../../config/theme";

import Panel from "../common/Panel";
import StatusDot from "../common/StatusDot";
import PnlTag from "../common/PnlTag";


export default function ExecutionHealthList({ rows }) {

  return (
    <Panel
      eyebrow="Salud · hora de sesión"
      title="Estado por ejecución"
      right={
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: COLORS.pos,
            border:`1px solid ${COLORS.hairline2}`,
            padding:"2px 6px",
            borderRadius:3
          }}
        >
          EN CURSO
        </span>
      }
    >

      <div
        style={{
          display:"flex",
          flexDirection:"column",
          gap:8,
          maxHeight:220,
          overflowY:"auto"
        }}
      >

        {rows.map((row)=>{

          const meta = SET_META[row.strategyId];


          return (

            <div
              key={row.execution.exec_id}
              style={{
                display:"grid",
                gridTemplateColumns:"auto 1fr auto auto auto",
                gap:10,
                alignItems:"center",
                padding:"6px 8px",
                borderRadius:3,
                background:COLORS.raised
              }}
            >


              <span
                style={{
                  width:4,
                  height:22,
                  background:meta.color,
                  borderRadius:2
                }}
              />


              <span
                style={{
                  fontFamily:FONT_BODY,
                  fontSize:12,
                  color:COLORS.hi,
                  overflow:"hidden",
                  textOverflow:"ellipsis",
                  whiteSpace:"nowrap"
                }}
              >
                {row.execution.name}
              </span>



              <span
                style={{
                  fontFamily:FONT_MONO,
                  fontSize:11,
                  color:COLORS.muted
                }}
              >
                {row.trades} tr
              </span>



              <StatusDot
                status={row.execution.status}
              />



              <span
                style={{
                  minWidth:90,
                  textAlign:"right"
                }}
              >
                <PnlTag
                  value={row.pnl}
                  size={12}
                />
              </span>


            </div>

          );

        })}

      </div>

    </Panel>
  );
}
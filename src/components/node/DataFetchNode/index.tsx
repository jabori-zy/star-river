//数据获取节点
// 订阅现货k线
import { useCallback, useState, useEffect } from 'react';
import {
    Handle, 
    type NodeProps, 
    Position,
    useReactFlow
} from '@xyflow/react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,

} from '@/components/ui/select'


const handleStyle = { left: 10 };

function SelectPlatform(
  {onExchangeChange}: {onExchangeChange: (exchange: string) => void}
) {
    return (
      <Select onValueChange={onExchangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择交易所" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="binance">Binance</SelectItem>
            <SelectItem value="okx">Okx</SelectItem>
            <SelectItem value="bitget">Bitget</SelectItem>
        </SelectContent>
      </Select>
    )
  }

function SelectSymbol(
  {onSymbolChange}: {onSymbolChange: (symbol: string) => void}
) {
    return (
      <Select onValueChange={onSymbolChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择交易对" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
            <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
        </SelectContent>
      </Select>
    )
  }

function SelectInterval(
  {onIntervalChange}: {onIntervalChange: (interval: string) => void}
) {
    return (
      <Select onValueChange={onIntervalChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择时间间隔" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="1m">1分钟</SelectItem>
            <SelectItem value="5m">5分钟</SelectItem>
            <SelectItem value="15m">15分钟</SelectItem>
        </SelectContent>
      </Select>
    )
}



//策略的起始节点
//设置数据的来源
function DataFetchNode({id, data, isConnectable}:NodeProps) {

    return (
        <div className="data-fetch-node">
            <Card>
                <CardHeader>
                    <CardTitle>获取数据</CardTitle>
                    <CardDescription>从数据源获取数据</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <SelectPlatform onExchangeChange={() => {}} />   
                    <SelectSymbol onSymbolChange={() => {}} />
                    <SelectInterval onIntervalChange={() => {}} />
                    <div>
                        <label htmlFor="text">价格:</label>
                        <label>0</label>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => {}}>获取数据</Button>
                </CardFooter>

                <Handle 
                    type="source" 
                    position={Position.Right} 
                    id="data_fetch_node_source"
                    className="w-3 h-3"
                    isConnectable={isConnectable}
                />
            </Card>
            

        </div>
    );
}

export default DataFetchNode;

# MIT License
# Copyright (c) 2021 Deltares
# For a copy, see <https://opensource.org/licenses/MIT>.
# Author: Gennadii Donchyts

import math
import numpy as np
import ee

def qnorm(x):
    return x.multiply(2).subtract(1).erfInv().multiply(math.sqrt(2))

def aggregateSum(images, aggregationDelta, aggregationUnit):
    times = images.reduceColumns(ee.Reducer.minMax(), ['system:time_start'])
    
    timeStart = ee.Date(times.get('min')).advance(aggregationDelta, aggregationUnit)
    timeStop = ee.Date(times.get('max'))
    
    def map_function(i):
        t = i.date()

        total = images.filterDate(t.advance(-aggregationDelta, aggregationUnit), t).sum()
        
        return total.copyProperties(i, ['system:time_start']).set({'count': total.bandNames().size()})
    
    return images.map(map_function).filterDate(timeStart, timeStop)

def computeCDF(images):
    percentiles = ee.List.sequence(0, 100)
    cdf = images.reduce(ee.Reducer.percentile(percentiles)).toArray()
    
    return cdf

def computeSPI(precipitation, aggregation, aggregationUnit, precipitationAll=None, cdfCache=None):
    precipitationAggregated = aggregateSum(precipitation, aggregation, aggregationUnit)
    
    cdf = computeCDF(precipitationAggregated)

    if precipitationAll:
        cdf = computeCDF(aggregateSum(precipitationAll, aggregation, aggregationUnit))

    if cdfCache:
        cdf = cdfCache

    # fix for max value
    cdf = cdf.arrayCat(ee.Image.constant(10000).toArray(), 0)
    
    def map_function(i):
        p = cdf.gte(i).arrayArgmax().arrayFlatten([['SPI']]).toInt()
        
        return qnorm(p.divide(100).clamp(0.00001, 0.99999)).copyProperties(i, ['system:time_start'])
    
    return precipitationAggregated.map(map_function)
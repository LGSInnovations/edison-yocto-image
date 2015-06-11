/*
 * Copyright (c) 2014 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


#ifndef __AGGREGATED_REPORT_INTERFACE_H
#define __AGGREGATED_REPORT_INTERFACE_H

#ifdef __cplusplus
extern "C" {
#endif

#include "iotkit.h"

typedef struct _AggregatedReportInterface {

    long startTimestamp;
    long endTimestamp;
    StringList *aggregationMethods;
    StringList *dimensions;
    int offset;
    int limit;
    bool countOnly;
    char *outputType;
    StringList *gatewayIds;
    StringList *deviceIds;
    StringList *componentIds;
    KeyValueParams *sort;
    AttributeFilterList *filters;
} AggregatedReportInterface;

AggregatedReportInterface *createAggregatedReportInterface();
AggregatedReportInterface *setReportStartTimestamp(AggregatedReportInterface *aggregatedReportInterfaceObject, long startTimestamp);
AggregatedReportInterface *setReportEndTimestamp(AggregatedReportInterface *aggregatedReportInterfaceObject, long endTimestamp);
AggregatedReportInterface *addAggregationMethods(AggregatedReportInterface *aggregatedReportInterfaceObject, char *aggregation);
AggregatedReportInterface *addDimensions(AggregatedReportInterface *aggregatedReportInterfaceObject, char *dimension);
AggregatedReportInterface *setOffset(AggregatedReportInterface *aggregatedReportInterfaceObject, int offset);
AggregatedReportInterface *setLimit(AggregatedReportInterface *aggregatedReportInterfaceObject, int limit);
AggregatedReportInterface *setReportCountOnly(AggregatedReportInterface *aggregatedReportInterfaceObject, bool countOnly);
AggregatedReportInterface *setOutputType(AggregatedReportInterface *aggregatedReportInterfaceObject, char *outputType);
AggregatedReportInterface *addReportDeviceIds(AggregatedReportInterface *aggregatedReportInterfaceObject, char *deviceId);
AggregatedReportInterface *addReportGatewayIds(AggregatedReportInterface *aggregatedReportInterfaceObject, char *gatewayId);
AggregatedReportInterface *addReportComponentIds(AggregatedReportInterface *aggregatedReportInterfaceObject, char *componentId);
AggregatedReportInterface *addReportSortInfo(AggregatedReportInterface *aggregatedReportInterfaceObject, char *name, char *value);
AggregatedReportInterface *addFilters(AggregatedReportInterface *aggregatedReportInterfaceObject, AttributeFilter *attributeFilter);

char *aggregatedReportInterface(AggregatedReportInterface *aggregatedReportInterfaceObject);

#ifdef __cplusplus
}
#endif

#endif

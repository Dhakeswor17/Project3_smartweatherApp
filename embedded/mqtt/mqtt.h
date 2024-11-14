#if 1
#ifndef MQTT_H_
#define MQTT_H_

#include "lwip/apps/mqtt.h"

#define IP_ADDR ""
#define BROKER_PORT 1883
#define MAX_CONNECTION_RETRIES 3

struct mqtt_connect_client_info_t mqtt_client_info=
{
  "weather_station",
  NULL, /* user */
  NULL, /* pass */
  60,  /* keep alive */
  NULL, /* will_topic */
  NULL, /* will_msg */
  0,    /* will_qos */
  0     /* will_retain */
#if LWIP_ALTCP && LWIP_ALTCP_TLS
  , NULL
#endif
};

#endif
#endif
library(jsonlite)

bas <- 'https://www.waterqualitydata.us/data/'
srh <- 'Station/search?'
rrh <- 'Result/search?'
org <- 'organization=CT_DEP01_WQX&'
prj <- 'project=LIS&'
sdt <- 'startDateLo=01-01-2020&'
act <- 'minactivities=1&'
mim <- 'mimeType=csv&'
prv <- 'zip=no&providers=STORET'

surl  <- paste0(bas,srh,org,prj,sdt,act,mim,prv)
sites <- read.csv(surl)

for(i in 1:dim(sites)[1]){
  mlid  <- sites$MonitoringLocationIdentifier[i]
  site  <- paste0('siteid=',mlid,'&')
  durl  <- paste0(bas,rrh,org,site,prj,sdt,mim,prv)
  sdata <- read.csv(durl)
  sdata <- sdata[sdata$ActivityTypeCode=='Field Msr/Obs',]
  sdata <- sdata[,c('MonitoringLocationIdentifier',
                    'ActivityStartDate',
                    'ActivityDepthHeightMeasure.MeasureValue',
                    'CharacteristicName',
                    'ResultMeasureValue',
                    'ResultMeasure.MeasureUnitCode')]
  
  dep  <- sdata[,c('ActivityStartDate','ActivityDepthHeightMeasure.MeasureValue')]
  mdep <- aggregate(ActivityDepthHeightMeasure.MeasureValue ~ ActivityStartDate, 
                    data = dep, min)
  
  sdata_mdep <- merge(sdata, mdep, 
                      by = c('ActivityDepthHeightMeasure.MeasureValue', 
                             'ActivityStartDate' ))
  
  char <- c("pH", "Dissolved oxygen (DO)", "Temperature", 
            "Conductivity", "Salinity", "Chlorophyll", "Phycocyanin (probe)")
  for(i in 1:length(char)){
    p <- char[i]
    d <- sdata_mdep[sdata_mdep$CharacteristicName == p,c("ResultMeasureValue",
                                                        "ActivityStartDate" ) ]
    n <- paste0('reports/',mlid,"_",char[i],'.json')
    write_json(d,n)
  }
}



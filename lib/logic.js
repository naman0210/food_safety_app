/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 *  Changing the status of shipment to the retailer
 *  @param {test.shipmentRecieved_by_retailer} shipmentreceivedbyretailer
 *  @transction
 */

 function shipmentreceivedbyretailer(shipmentreceivedbyretailer) {
   var factory=getFactory();
   var NS="test";

   var shipment = shipmentreceivedbyretailer.shipment;
   var vendor = shipmentreceivedbyretailer.shipment.fooditem.vendor;
   var retailer = shipmentreceivedbyretailer.shipment.retailer;
   var fooditem = shipmentreceivedbyretailer.shipment.fooditem;
   var retaileraccountbalance = shipmentreceivedbyretailer.shipment.retailer.accountbalance;
   var vendoraccountbalance = shipmentreceivedbyretailer.shipment.fooditem.vendor.accountbalance;

   var totalcost = shipment.number*fooditem.price;
   try{
     if (retaileraccountbalance<totalcost)
     {
       throw "Insufficient funds";
     }
     else {
       retaileraccountbalance -= totalcost;
       vendoraccountbalance += totalcost;
       shipment.status = "DELIVERED"
       fooditem.availstatus = "Not_Available";
       var fooditemownedbyretailer = factory.newResource(NS,'food_item_owned_by_retailer',fooditem.batch_num);
       fooditemownedbyretailer.name = fooditem.name;
       fooditemownedbyretailer.retailer = factory.newRelationship(NS,'Retailer',retailer);
       fooditemownedbyretailer.price = fooditem.price;
       fooditemownedbyretailer.mkgdate = fooditem.mkgdate;
       fooditemownedbyretailer.availstatus = "Available";
       //JavaScript promises
       return getAssetRegistry(NS+'.food_item_owned_by_retailer')
       .then(function(assetregistry){
         assetregistry.add(fooditemownedbyretailer);
       });
     }
   }
   catch(err){
     alert(err);
   }
 }


/**
 * Change the shipment status of shipment to Consumer
 * @param {test.shipment_to_consumer} shipmenttoconsumer
 * @transction
 */

 function shipmenttoconsumer(shipmenttoconsumer){
   var factory = getFactory();
   var NS = "test";

   var shipment = shipmenttoconsumer.shipment;
   var retailer = shipmenttoconsumer.shipment.fooditem.retailer;
   var consumer = shipmenttoconsumer.shipment.consumer;
   var fooditem = shipmenttoconsumer.shipment.fooditem;
   var retaileraccountbalance = shipmenttoconsumer.shipment.fooditem.retailer.accountbalance;
   var consumeraccountbalance = shipmenttoconsumer.shipment.consumer.accountbalance;

   var totalcost = shipmenttoconsumer.number*fooditem.price;

   try{
     if(consumeraccountbalance<totalcost)
     {
       throw "Insufficient funds";
     }
     else{
       consumer.accountbalance -= totalcost;
       retailer.accountbalance += totalcost;
       shipment.status = "DELIVERED";
       fooditem.availstatus = "Not_Available";

       var fooditemownedbyconsumer = factory.newResource(NS,'Consumer',fooditem.batch_num);
       fooditemownedbyconsumer.name = fooditem.name;
       fooditemownedbyconsumer.price = fooditem.price;
       fooditemownedbyconsumer.mkgdate = fooditem.mkgdate;
       fooditemownedbyconsumer.consumer = factory.newRelationship(NS,'Consumer',consumer);

       //JavaScript promises

       return getAssetRegistry(NS+'.food_item_owned_by_consumer')
       .then(function(consumerregistry){
         consumerregistry.add(fooditemownedbyconsumer);
       });
     }
   }
   catch(err)
   {
     alert(err);
   }
 }

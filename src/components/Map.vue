<template>
  <div style="position: absolute; height: 100%; width: 100%; z-index: 1;">
    <l-map ref="map" :zoom="zoom" :center="center">
      <l-tile-layer :url="url"></l-tile-layer>
      <zone-layer @click="onZoneClicked" :update="updateZoneLayer" />
    </l-map>
    <v-dialog v-model="showCreate" persistent width="400px">
      <v-card>
        <v-card-title class="headline">
          Create Zone
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="zoneName" label="Enter zone name">
            </v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createZone">Create</v-btn>
          <v-btn color="error" @click="cancelCreate">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDelete" persistent width="400px">
      <v-card>
        <v-card-title class="headline">
          Delete Zone
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete zone {{ currentZoneItem.name }} and
          associated data? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="deleteZone">Delete</v-btn>
          <v-btn color="primary" @click="cancelDeleteZone">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { LMap, LTileLayer, LLayerGroup, LCircle } from "vue2-leaflet";
import { Vue, Component } from "vue-property-decorator";
import { BASE_URL } from "../api/Config";
import "leaflet-draw";
import { Map as LeafletMap, Circle, Draw, Control } from "leaflet";
import { Zone, DEFAULT_ZONE } from "./Util";
import ZoneLayer from "@/components/ZoneLayer.vue";

@Component({
  components: {
    LMap,
    LTileLayer,
    LLayerGroup,
    LCircle,
    ZoneLayer
  }
})
export default class Map extends Vue {
  zoom = 5;
  center = [6.839169626342808, -58.71093750000001];
  url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  zones: Array<Circle> | null = null;
  map?: LeafletMap;
  showCreate = false;
  showDelete = false;
  zone?: Circle;
  zoneName = "";
  currentZoneItem: Zone = DEFAULT_ZONE;
  updateZoneLayer = 0;

  async mounted() {
    this.$nextTick(() => {
      const leafletMap: any = this.$refs.map;
      const map = leafletMap.mapObject;
      this.map = map;
      this.configureDrawer(map);
    });
  }

  cancelCreate() {
    this.showCreate = false;
    if (this.zone) this.zone.remove();
    this.zone = undefined;
    this.zoneName = "";
  }

  async createZone() {
    if (!this.zone) return;
    const latlng = this.zone.getLatLng();
    const zoneObj = {
      latitude: latlng.lat,
      longitude: latlng.lng,
      radius: this.zone.getRadius(),
      name: this.zoneName
    };
    try {
      await this.$http.post(BASE_URL + "/zones", zoneObj, {
        headers: { "content-type": "application/json" }
      });
      this.refreshZoneLayer();
    } catch (e) {
      console.log(e);
      //this.$emit("error", e)
    } finally {
      this.cancelCreate();
    }
  }

  onZoneClicked(item: Zone) {
    this.currentZoneItem = item;
    this.showDelete = true;
  }

  cancelDeleteZone() {
    this.currentZoneItem = DEFAULT_ZONE;
    this.showDelete = false;
  }

  async deleteZone() {
    await this.$http.delete(BASE_URL + "/zones/" + this.currentZoneItem._id);
    this.cancelDeleteZone();
    this.refreshZoneLayer();
  }

  refreshZoneLayer() {
    this.updateZoneLayer = Math.random();
  }

  configureDrawer(map: LeafletMap) {
    const drawer = new Control.Draw({
      draw: {
        polyline: false,
        polygon: false,
        rectangle: false,
        circlemarker: false,
        marker: false
      }
    });
    map.on(Draw.Event.CREATED, event => {
      const layer = event.layer;
      if (this.map) {
        this.zone = new Circle(layer._latlng).setRadius(layer._mRadius);
        this.zone.addTo(this.map);
        this.showCreate = true;
      }
    });
    drawer.addTo(map);
  }
}
</script>

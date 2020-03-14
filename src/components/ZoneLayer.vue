<template>
  <l-geo-json :geojson="geojson" :options="options" />
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { LGeoJson } from "vue2-leaflet";
import { BASE_URL } from "../api/Config";
import { GeoJSONOptions, Circle } from "leaflet";

@Component({
  components: {
    LGeoJson
  },
  props: {
    update: {
      type: Number
    }
  }
})
export default class ZoneLayer extends Vue {
  geojson = {
    type: "FeatureCollection",
    features: []
  };
  options: GeoJSONOptions = {
    onEachFeature: (feature, layer) => {
      layer.on("click", () => this.click(feature.properties));
    },
    pointToLayer: (feature, latLng) =>
      new Circle(latLng)
        .setRadius(feature.properties.radius)
        .setStyle({ color: "red" })
  };

  @Watch("update")
  onUpdateChanged() {
    this.load();
  }

  mounted() {
    this.load();
  }

  async load() {
    const response = await this.$http.get(BASE_URL + "/zones?format=geojson");
    this.geojson = response.data;
  }

  click(zone: any) {
    this.$emit("click", zone);
  }
}
</script>

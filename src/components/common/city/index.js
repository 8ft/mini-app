
const getLetter = require('../../../utils/pinyin.js')
  
Component({
  properties: {
    height:String,
    data:{
      type:Object,
      value:null,
      observer(newVal, oldVal, changedPath) {
        this._updateCityList(newVal)
      }
    }
  },
  data: {
    cities:null,
    letters:'ABCDEFGHJKLMNPQRSTWXYZ',
    scrollTo:''
  },

  lifetimes: {
    ready() {
      this.triggerEvent('init', { data: this.data.cities})
    }
  },

  methods: {
    _locate:function(e){
      this.setData({
        scrollTo:e.currentTarget.dataset.letter
      })
    },

    _select:function(e){
      this.triggerEvent('select', { city: e.currentTarget.dataset.city})
    },

    _updateCityList(cityList) {
      if(cityList.hot){
        this.setData({
          cities:cityList
        })
      }else{
        const hotCitys = cityList.filter((item, index, array) => {
          return item.zoneLevel === 1
        })
        const cities= {
          hot:hotCitys,
          list:{}
        }

        const letterList = this.data.letters.split('')
        letterList.forEach(letter => {
          cities.list[letter] = []
        })

        let leftLetters=[]
        let letter
        cityList.forEach(city => {
          if (city.zoneName==='重庆市'){
            cities.list['C'].push(city)
            leftLetters.indexOf('C')<0&&leftLetters.push('C')
          }else{
            letter=getLetter(city.zoneName[0])[0]
            cities.list[letter].push(city)
            leftLetters.indexOf(letter)<0&&leftLetters.push(letter)
          }
        })

        cities.existLetters=letterList.filter(letter=>{
          return leftLetters.some(leftLetter=>{
            return leftLetter===letter
          })
        })
        
        this.setData({
          cities:cities
        })
      }
    }
  }

})
require('../../spec_helper')

const SmartGridProcessor = require('../../../lib/processors/smart_grid_processor')

const _ = require('lodash')

describe('SmartGridProcessor', function () {
  describe('.buildFilters()', function () {
    context('when multiple asset.Product2 with the same Name are present', function () {
      let assets, processor, queryAssetSpy, extractWebResourcesSpy

      beforeEach(() => {
        assets = [
          {
            Product2: {
              Id: 'sfdc_product_1',
              Name: 'Product Name',
              Class__c: 'Product class 1'
            },
            Participant__r: {
              Id: 'sfdc_participant_1',
              Name: 'Same Name Different ID'
            }
          },
          {
            Product2: {
              Id: 'sfdc_product_2',
              Name: 'Product Name',
              Class__c: 'Product class 2'
            },
            Participant__r: {
              Id: 'sfdc_participant_2',
              Name: 'Same Name Different ID'
            }
          }
        ]

        processor = new SmartGridProcessor('sfdc_program_1')

        queryAssetSpy = jest.spyOn(processor, '_queryAssets').mockImplementation(() => {
          return Promise.resolve(assets)
        })

        let webResources = {
          sfdc_product_1: {
            'Sub-Sector': [
              {
                Id: 'sfdc_web_resource_1',
                Name: 'Web Resource 1',
                links: [
                  {
                    Id: 'web_resource_link_id_1',
                    Web_Resource__c: 'sfdc_web_resource_1',
                    DisplayName__c: 'Link 1',
                    URL__c: 'https://example.org/link_1'
                  }
                ]
              },
              {
                Id: 'sfdc_related_web_resource_1',
                Name: 'Related Web Resource 1',
                links: [
                  {
                    Id: 'web_resource_link_id_4',
                    Web_Resource__c: 'sfdc_related_web_resource_1',
                    DisplayName__c: 'Link 4',
                    URL__c: 'https://example.org/link_4'
                  }
                ]
              }
            ]
          },
          sfdc_product_2: {
            'Sub-Sector': [
              {
                Id: 'sfdc_web_resource_2',
                Name: 'Web Resource 2',
                Summary__c: 'Web Resource 2 Summary',
                links: [
                  {
                    Id: 'web_resource_link_id_2',
                    Web_Resource__c: 'sfdc_web_resource_2',
                    DisplayName__c: 'Link 2',
                    URL__c: 'https://example.org/link_2'
                  },
                  {
                    Id: 'web_resource_link_id_3',
                    Web_Resource__c: 'sfdc_web_resource_2',
                    DisplayName__c: 'Link 3',
                    URL__c: 'https://example.org/link_3'
                  }
                ]
              }
            ]
          }
        }

        extractWebResourcesSpy = jest.spyOn(processor, '_extractWebResources').mockImplementation(() => {
          return Promise.resolve(webResources)
        })
      })

      afterEach(() => {
        extractWebResourcesSpy.mockReset()
        extractWebResourcesSpy.mockRestore()
        queryAssetSpy.mockReset()
        queryAssetSpy.mockRestore()
      })

      it('returns Sub-Sector filters', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let subSectors = _.values(filterMapByType['Sub-Sector'])
            expect(subSectors).toHaveLength(3)

            let subSector = subSectors[2].asJson()
            let expectedSubSector = {
              name: 'Web Resource 2',
              type: 'Sub-Sector',
              summary: 'Web Resource 2 Summary',
              sfdc_id: ['sfdc_web_resource_2'],
              sub_sector_id: [3],
              category_id: [2],
              product_type_id: [1],
              provider_id: [2],
              links: [
                {
                  display_name: 'Link 2',
                  url: 'https://example.org/link_2'
                },
                {
                  display_name: 'Link 3',
                  url: 'https://example.org/link_3'
                }
              ]
            }

            expect(subSector).toEqual(expectedSubSector)
          })
      })

      it('returns Category filters', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let categories = _.values(filterMapByType.Category)
            expect(categories).toHaveLength(2)

            let category = categories[1].asJson()
            let expectedCategory = {
              name: 'Product class 2',
              type: 'Category',
              summary: null,
              sfdc_id: [],
              sub_sector_id: [3],
              category_id: [2],
              product_type_id: [1],
              provider_id: [2],
              links: []
            }

            expect(category).toEqual(expectedCategory)
          })
      })

      it('returns a Product Type filter', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let productTypes = _.values(filterMapByType['Product Type'])
            expect(productTypes).toHaveLength(1)

            let productType = productTypes[0].asJson()
            let expectedProductType = {
              name: 'Product Name',
              type: 'Product Type',
              summary: null,
              sfdc_id: [
                'sfdc_product_1',
                'sfdc_product_2'
              ],
              sub_sector_id: [1, 2, 3],
              category_id: [1, 2],
              product_type_id: [1],
              provider_id: [1, 2],
              links: []
            }

            expect(productType).toEqual(expectedProductType)
          })
      })

      it('returns Provider filters', function () {
        return processor.buildFilters('sfdc_program_1')
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let providers = _.values(filterMapByType.Provider)
            expect(providers).toHaveLength(2)

            let provider = providers[0].asJson()
            let expectedProvider = {
              name: 'Same Name Different ID',
              type: 'Provider',
              summary: null,
              sfdc_id: ['sfdc_participant_1'],
              sub_sector_id: [1, 2],
              category_id: [1],
              product_type_id: [1],
              provider_id: [1],
              links: [
                {
                  display_name: 'Same Name Different ID',
                  url: 'https://www.export.gov/provider?id=sfdc_participant_1'
                }
              ]
            }
            expect(provider).toEqual(expectedProvider)
          })
      })
    })
  })
})

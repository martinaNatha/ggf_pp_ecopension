Select 
  pm.LASTNAME, 
  pm.SEXCD, 
  pm.EMAIL,
  po.ORGNAME,
  cd.SCHEME_BRANCHE
from PORTAL.PTL_MEMBERS pm 
INNER JOIN PORTAL.PTL_ORGANIZATIONS po on pm.ORG_NAMEID = po.NAMEID 
INNER JOIN PORTAL.PTL_CASE_DATA cd on pm.ORG_NAMEID = cd.ORG_NAMEID 
where pm.MBR_NO ='in_un2'